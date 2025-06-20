<template>
  <div class="bg-grayscale-100 w-full fixed inset-0 z-50 overflow-y-auto">
    <div class="px-4 py-10 md:px-8 lg:px-16 max-w-[1920px] mx-auto">
      <ConfirmationModal
        :visible="confirmationVisible"
        @confirm="handleCancel"
        @cancel="hideConfirmation"
      >
        <template #subtitle>Any changes will not be saved</template>
      </ConfirmationModal>
      <div v-if="!modelId">
        <Dropzone
          v-model="file"
          @update="handleFileUpdate"
          @cancel="handleCancel"
        />
      </div>
      <div v-else-if="file" class="flex flex-col gap-10 md:flex-row md:gap-16">
        <div class="w-full md:w-3/7 md:max-h-[400px]">
          <h1 class="title text-primary-500 mb-5">New 3D Model</h1>
          <Visualizer
            :model-id="modelId"
            :file-ref="file"
            :capture-request="snapCamera"
            @capture-complete="setSnapCamera(false)"
            :delete-unsaved="cleanUnsaved"
            @unsaved-deleted="setCleanUnsaved(false)"
            :commit-unsaved="commitUnsaved"
            @unsaved-commited="hotspotCommited"
            editing
          />
        </div>
        <div class="w-full md:w-4/7">
          <ModelForm :section="section" />
          <div class="grid grid-cols-2 gap-3 md:gap-30 lg:gap-50 mt-10">
            <Button
              v-if="section === 1"
              @click="showConfirmation"
              type="secondary"
              class="w-full justify-center"
              :disabled="publishing || hotspotStore.isHotspotMode"
              >Cancel upload</Button
            >
            <Button
              v-if="section !== 1"
              @click="section--"
              type="secondary"
              class="w-full justify-center"
              >Back</Button
            >
            <Button
              v-if="section !== 3"
              @click="section++"
              type="primary"
              class="w-full justify-center"
              >Next</Button
            >
            <Button
              v-if="section === 3"
              @click="handleValidate"
              type="success"
              class="w-full justify-center"
              :disabled="publishing || hotspotStore.isHotspotMode"
            >
              <Spinner
                v-show="publishing"
                :size="16"
                class="fill-success-900"
              />
              <span v-show="!publishing">Publish model</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import Dropzone from "../Dropzone.vue";
import { useUpload } from "../../scripts/useUpload.ts";
import { useToastStore } from "../../stores/toastStore.ts";
import { v4 as uuidv4 } from "uuid";
import ConfirmationModal from "../ConfirmationModal.vue";
import Visualizer from "../three/Visualizer.vue";
import ModelForm from "../ModelForm.vue";
import Button from "../Button.vue";
import Spinner from "../Spinner.vue";
import { useModelStore } from "../../stores/modelStore.ts";
import { dataUrlToFile } from "../../scripts/hhUtils.ts";
import { storeToRefs } from "pinia";
import { useHotspotStore } from "../../stores/hotspotStore.ts";
import { useDimensions } from "../../scripts/useDimensions.ts";
import { useRouter } from "vue-router";

const modelId = ref<string | null>(null);
const publishing = ref(false);
const confirmationVisible = ref(false);

const section = ref(1);

const modelStore = useModelStore();
const toastStore = useToastStore();
const hotspotStore = useHotspotStore();

const router = useRouter();

const {
  file,
  thumbnail,
  selectedDimensions,
  selectedHotspots,
  uploadAttempted,
  validateForm,
  isValid,
  getObjectUploadUrl,
  uploadModeltoR2,
  publishModel,
} = useUpload();

const { dimensions } = useDimensions();

const { hotspots } = storeToRefs(hotspotStore);

const handleFileUpdate = () => {
  if (!file.value) return;

  modelId.value = uuidv4();
};

const handleValidate = () => {
  uploadAttempted.value = true;
  validateForm();
  if (!isValid.value) {
    toastStore.showToast("error", "Please check the fields and try again.");
    return;
  }
  uploadModel();
};

const uploadModel = async () => {
  if (!modelId.value || !file.value || !thumbnail.value) return;
  publishing.value = true;

  // 3D File Upload
  console.log("Uploading model to Cloudflare...");
  const { modelUrl, thumbnailUrl } = await getObjectUploadUrl(modelId.value);
  const modelUploaded = await uploadModeltoR2(file.value, modelUrl);
  const thumbnailUploaded = await uploadModeltoR2(
    dataUrlToFile(thumbnail.value),
    thumbnailUrl,
  );

  if (!modelUploaded || !thumbnailUploaded) {
    toastStore.showToast("error", "Failed to publish model");
    publishing.value = false;
    return;
  }
  console.log("SUCCESS");

  // Database write
  console.log("Writing model info to database...");
  selectedDimensions.value = dimensions.value;
  selectedHotspots.value = hotspots.value;

  const success = await publishModel(modelId.value);

  if (!success) {
    toastStore.showToast("error", "Failed to publish model");
    publishing.value = false;
    return;
  }
  console.log("SUCCESS");

  modelStore.resetPagination();
  modelStore.removeCachedUrls(modelId.value);

  publishing.value = false;

  file.value = null;
  modelId.value = null;
  toastStore.showToast("success", "Model published successfully!");

  modelStore.fetchModels();
  router.replace("/");
};

const showConfirmation = () => {
  confirmationVisible.value = true;
};

const hideConfirmation = () => {
  confirmationVisible.value = false;
};

const handleCancel = () => {
  file.value = null;
  modelId.value = null;

  router.back();
};

const snapCamera = ref(false);

const setSnapCamera = (active: boolean) => {
  snapCamera.value = active;
};

provide("setSnap", setSnapCamera);

const cleanUnsaved = ref(false);

const setCleanUnsaved = (active: boolean) => {
  cleanUnsaved.value = active;
};

const commitUnsaved = ref(false);
const setCommitUnsaved = (active: boolean) => {
  commitUnsaved.value = active;
};

provide("setCommit", setCommitUnsaved);

const hotspotCommited = () => {
  setCommitUnsaved(false);
};

const exitHotspotMode = () => {
  hotspotStore.setHotspotMode(false);
  setCleanUnsaved(true);
};

provide("exitHotspotMode", exitHotspotMode);
</script>
