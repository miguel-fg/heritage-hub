<template>
  <div class="w-full @container">
    <div
      class="min-h-screen flex gap-5 mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <div
        v-if="fileSelected && !publishing"
        class="flex gap-8 w-full max-w-[1080px] mx-auto"
      >
        <!-- Step 1: 3D Model configuration -->
        <div
          v-show="uploadStep === 1"
          class="w-full h-full flex flex-col gap-8"
        >
          <h1 class="title text-primary-500">3D Model Settings</h1>
          <div
            class="flex flex-col md:flex-row w-full h-[550px] lg:h-[600px] 2xl:[h-700px] gap-2"
          >
            <div class="flex flex-col w-full gap-1 md:w-8/10">
              <h1 class="subtitle text-grayscale-700 w-full text-center">
                3D Model Preview
              </h1>
              <div
                class="flex max-h-[550px] lg:max-h-[600px] 2xl:max-h-[700px] h-full w-full bg-white"
              >
                <Visualizer
                  v-if="modelId && file"
                  :modelId="modelId"
                  editing
                  :fileRef="file"
                  :capture-request="snapCamera"
                  @capture-complete="completeCapture"
                  :delete-unsaved="clearUnsavedMarker"
                  @unsaved-deleted="completeDeleteUnsaved"
                />
              </div>
              <label
                for="allow-download"
                class="flex gap-2 items-center cursor-pointer font-poppins text-grayscale-900 mt-2"
              >
                <input
                  id="allow-download"
                  type="checkbox"
                  class="sr-only absolute overflow-hidden"
                  tabindex="-1"
                  v-model="downloadable"
                />
                <span
                  class="relative w-4 h-4 rounded-xs border border-grayscale-300 text-grayscale-100 flex items-center justify-center bg-white"
                >
                  <span
                    v-show="downloadable"
                    class="w-2 h-2 bg-primary-500 rounded-xs"
                  ></span>
                </span>
                Allow model download
              </label>
            </div>
            <div class="flex flex-col w-60 md:w-2/10 gap-8">
              <div class="flex flex-col gap-1 w-full items-center">
                <h1 class="subtitle text-grayscale-700">Thumbnail</h1>
                <img
                  v-if="thumbnail"
                  :src="thumbnail"
                  alt="Model thumbnail preview"
                  class="rounded-xs shadow-sm"
                />
                <Button
                  @click="triggerCapture"
                  type="ghost-icon"
                  class="mt-3 w-full justify-center"
                >
                  <CameraIcon :width="19" :height="16" class="fill-current" />
                  <span class="ml-1">Re-capture</span>
                </Button>
              </div>
              <div class="flex flex-col w-full items-center gap-3">
                <div class="flex flex-col gap-1 w-full">
                  <h1 class="subtitle text-grayscale-700 w-full text-center">
                    Hotspots
                  </h1>
                  <InfoMessage v-show="hotspotStore.isHotspotMode" type="info">
                    <template #title>Hotspot Mode</template>
                    <template #content
                      >Click or tap anywhere on the model to add a new
                      hotspot.</template
                    >
                  </InfoMessage>
                </div>
                <div class="flex flex-col w-full gap-1">
                  <div v-for="(h, k) in hotspotState">
                    <HotspotCard :hotspotId="Number(k)" :hotspot="h" />
                  </div>
                </div>
                <Button
                  @click="enterHotspotMode"
                  v-if="!hotspotStore.isHotspotMode"
                  type="ghost-icon"
                  class="w-full justify-center"
                >
                  <PlusIcon :size="16" class="fill-current" />
                  <span class="ml-1">Add New</span>
                </Button>
                <Button
                  @click="exitHotspotMode"
                  v-else
                  type="secondary"
                  class="w-full justify-center"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          <div class="flex justify-between w-full mt-8">
            <Button @click="resetState" type="secondary">Back</Button>
            <div class="font-poppins text-grayscale-500">Page 1 of 3</div>
            <Button @click="() => (uploadStep = 2)" type="primary">Next</Button>
          </div>
        </div>
        <!-- Step 2: Model metadata form-->
        <div
          v-show="uploadStep === 2"
          class="flex flex-col gap-8 w-full max-w-[1080px] mx-auto"
        >
          <h1 class="title text-primary-500">Model Information</h1>
          <ModelForm />
          <div class="flex justify-between w-full mt-4">
            <Button @click="() => (uploadStep = 1)" type="secondary"
              >Back</Button
            >
            <div class="font-poppins text-grayscale-500">Page 2 of 3</div>
            <Button @click="handleValidate" type="primary">Next</Button>
          </div>
        </div>
        <!-- Step 3: Summary -->
        <div
          v-show="uploadStep === 3"
          class="flex flex-col gap-8 w-full max-w-[1080px] mx-auto"
        >
          <Summary />
          <div class="flex justify-between w-full mt-4">
            <Button
              @click="() => (uploadStep = 2)"
              type="secondary"
              :disable="publishing"
              >Back</Button
            >
            <div class="font-poppins text-grayscale-500">Page 3 of 3</div>
            <Button
              @click="handlePublish"
              type="success"
              :disabled="publishing"
              class="items-center"
            >
              <Spinner
                v-show="publishing"
                :size="16"
                class="fill-success-900"
              />
              <span>{{ publishing ? "Publishing" : "Publish" }}</span>
            </Button>
          </div>
        </div>
      </div>
      <div v-else class="w-full max-w-[1080px] mx-auto flex flex-col">
        <Dropzone
          v-model="file"
          @update="handleFileUpdate"
          @cancel="cancelUpload"
        />
      </div>
    </div>
    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import Dropzone from "../components/Dropzone.vue";
import ModelForm from "../components/ModelForm.vue";
import Visualizer from "../components/three/Visualizer.vue";
import Button from "../components/Button.vue";
import Footer from "../components/Footer.vue";
import HotspotCard from "../components/upload/HotspotCard.vue";
import { useModelStore } from "../stores/modelStore";
import { useDimensions } from "../scripts/useDimensions";
import { useHotspotStore } from "../stores/hotspotStore";
import { useToastStore } from "../stores/toastStore";
import { useUpload } from "../scripts/useUpload";
import axiosInstance from "../scripts/axiosConfig";
import axios from "axios";
import Summary from "../components/upload/Summary.vue";
import InfoMessage from "../components/InfoMessage.vue";
import PlusIcon from "../components/icons/PlusIcon.vue";
import CameraIcon from "../components/icons/CameraIcon.vue";
import Spinner from "../components/Spinner.vue";

const fileSelected = ref(false);

const uploadStep = ref(1);

const modelId = ref<string | null>(null);
const file = ref<File | null>(null);

const publishing = ref(false);

const modelStore = useModelStore();
const toastStore = useToastStore();

const { dimensions: dimensionsState } = useDimensions();
const {
  thumbnail,
  downloadable,
  selectedDimensions,
  selectedHotspots,
  publishModel,
  isValid,
  validateForm,
  uploadAttempted,
} = useUpload();

const hotspotStore = useHotspotStore();
const { hotspots: hotspotState } = storeToRefs(hotspotStore);
const snapCamera = ref(false);

const triggerCapture = () => {
  snapCamera.value = true;
};

const completeCapture = () => {
  snapCamera.value = false;
};

const clearUnsavedMarker = ref(false);

const completeDeleteUnsaved = () => {
  clearUnsavedMarker.value = false;
};

const resetState = () => {
  fileSelected.value = false;
  file.value = null;
  modelId.value = null;
  publishing.value = false;
};

const enterHotspotMode = () => {
  hotspotStore.setHotspotMode(true);
};

const exitHotspotMode = () => {
  hotspotStore.setHotspotMode(false);
  clearUnsavedMarker.value = true;
};

const handleFileUpdate = async () => {
  if (!file.value) return;

  modelId.value = uuidv4();
  fileSelected.value = true;
  uploadStep.value = 1;
};

const handleValidate = () => {
  uploadAttempted.value = true;
  validateForm();
  if (!isValid.value) {
    toastStore.showToast("error", "Please check the fields and try again.");
    return;
  }
  uploadStep.value = 3;
};

const handlePublish = async () => {
  if (!modelId.value || !thumbnail.value || !file.value) return;

  publishing.value = true;

  // 3D File
  console.log("[Upload.vue] Uploading model to Cloudflare...");
  const { modelUrl, thumbnailUrl } = await getObjectUploadUrl(modelId.value);
  const modelUploaded = await uploadModeltoR2(file.value, modelUrl);
  const thumbUploaded = await uploadModeltoR2(
    dataUrlToFile(thumbnail.value),
    thumbnailUrl,
  );

  if (!modelUploaded || !thumbUploaded) {
    toastStore.showToast("error", "Failed to publish model");
    publishing.value = false;
    return;
  }
  console.log("[Upload.vue] SUCCESS");

  // Database write
  console.log("[Upload.vue] Writing model data to database...");
  selectedDimensions.value = dimensionsState.value;
  selectedHotspots.value = hotspotState.value; // Missing sanitazion

  const success = await publishModel(modelId.value);

  if (!success) {
    toastStore.showToast("error", "Failed to publish model");
    publishing.value = false;
    return;
  }
  console.log("[Upload.vue] SUCCESS");

  modelStore.resetPagination();
  modelStore.removeCachedUrls(modelId.value);

  publishing.value = false;

  toastStore.showToast("success", "Model published successfully!");
  router.replace("/");
};

const getObjectUploadUrl = async (modelId: string) => {
  try {
    const response = await axiosInstance.post(`/models/upload-url`, {
      modelId,
    });

    const urls = response.data;

    return urls;
  } catch (error) {
    console.error("Failed to fetch upload presigned URL. ERR: ", error);
    return null;
  }
};

const uploadModeltoR2 = async (file: File, presignedUrl: string) => {
  try {
    const response = await axios.put(presignedUrl, file);

    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading file to Cloudflare R2. ERR: ", error);
    return false;
  }
};

const dataUrlToFile = (dataUrl: string): File => {
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });

  const file = new File([blob], "thumbnail.png", { type: mimeString });

  return file;
};

const router = useRouter();

const cancelUpload = async () => {
  resetState();
  router.push("/");
};

onUnmounted(() => {
  resetState();
});
</script>
