<template>
  <div class="bg-grayscale-100 w-full fixed inset-0 z-50 overflow-y-auto">
    <div
      v-if="toEdit"
      class="px-4 py-10 md:px-8 lg:px-16 max-w-[1920px] mx-auto"
    >
      <ConfirmationModal
        :visible="confirmationVisible"
        @confirm="handleCancel"
        @cancel="hideConfirmation"
      >
        <template #subtitle>Any changes will not be saved</template>
      </ConfirmationModal>
      <div class="flex flex-col gap-10 md:flex-row md:gap-16">
        <div class="w-full md:w-3/7 md:max-h-[400px]">
          <h1 class="title text-primary-500 mb-5">Edit 3D Model</h1>
          <Visualizer
            :model-id="toEdit.id"
            :capture-request="snapCamera"
            @capture-complete="setSnapCamera(false)"
            :delete-unsaved="cleanUnsaved"
            @unsaved-deleted="setCleanUnsaved(false)"
            :commit-unsaved="commitUnsaved"
            @unsaved-commited="hotspotCommited"
          />
          <div class="w-full grid grid-cols-2 gap-3 mt-5 mb-5">
            <Button
              @click="hotspotStore.setHotspotMode(true)"
              type="primary"
              class="w-full justify-center"
              :disabled="saving || hotspotStore.isHotspotMode"
              >Add hotspot</Button
            >
            <Button
              @click="setSnapCamera(true)"
              type="outline"
              class="w-full justify-center"
              :disabled="saving || hotspotStore.isHotspotMode"
              >New thumbnail</Button
            >
          </div>
          <HotspotForm
            v-if="hotspotStore.isHotspotMode"
            @saved="setCommitUnsaved(true)"
            @exit="exitHotspotMode"
          />
        </div>
        <div class="w-full md:w-4/7">
          <EditForm />
          <div class="grid grid-cols-2 gap-3 md:gap-30 lg:gap-50 mt-20">
            <Button
              @click="showConfirmation"
              type="secondary"
              class="w-full justify-center"
              :disabled="saving || hotspotStore.isHotspotMode"
              >Cancel edit</Button
            >
            <Button
              @click="handleValidate"
              class="w-full justify-center"
              type="success"
              :disabled="saving || hotspotStore.isHotspotMode"
            >
              <Spinner v-show="saving" :size="16" class="fill-success-900" />
              <span v-show="!saving">Save changes</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useHotspotStore } from "../../stores/hotspotStore";
import Button from "../Button.vue";
import HotspotForm from "../upload/HotspotForm.vue";
import Spinner from "../Spinner.vue";
import EditForm from "./EditForm.vue";
import ConfirmationModal from "../ConfirmationModal.vue";
import { useEdit } from "../../scripts/useEdit";
import Visualizer from "../three/Visualizer.vue";
import { useToastStore } from "../../stores/toastStore";
import { useModelStore } from "../../stores/modelStore";

const emit = defineEmits(["save", "cancel"]);
const router = useRouter();

const confirmationVisible = ref(false);

const showConfirmation = () => {
  confirmationVisible.value = true;
};

const hideConfirmation = () => {
  confirmationVisible.value = false;
};

const saving = ref(false);

const modelStore = useModelStore();
const hotspotStore = useHotspotStore();

const { toEdit, resetEditState, validateForm, isValid, saveChanges } =
  useEdit();

const snapCamera = ref(false);

const setSnapCamera = (active: boolean) => {
  snapCamera.value = active;
};

const cleanUnsaved = ref(false);

const setCleanUnsaved = (active: boolean) => {
  cleanUnsaved.value = active;
};

const commitUnsaved = ref(false);
const setCommitUnsaved = (active: boolean) => {
  commitUnsaved.value = active;
};

const toastStore = useToastStore();

const handleValidate = async () => {
  if (!toEdit.value) return;

  saving.value = true;
  validateForm();

  if (!isValid.value) {
    toastStore.showToast("error", "Failed to save model changes.");
    saving.value = false;
    return;
  }

  const success = await saveChanges();

  if (!success) {
    toastStore.showToast("error", "Failed to save model changes.");
    saving.value = false;
    return;
  }

  toastStore.showToast("success", "Model updated successfully!");

  modelStore.removeCachedUrls(toEdit.value.id);
  modelStore.resetPagination();
  saving.value = false;
  router.back();
};

const handleCancel = () => {
  confirmationVisible.value = false;
  emit("cancel");
};

const hotspotCommited = () => {
  setCommitUnsaved(false);
};

const exitHotspotMode = () => {
  hotspotStore.setHotspotMode(false);
  setCleanUnsaved(true);
};

onMounted(() => {
  if (!toEdit.value) {
    console.error("[EditModal.vue] No model provided for editing.");
    resetEditState();
    router.back();
  } else {
    hotspotStore.setHotspotState(toEdit.value.hotspots);
  }
});

onUnmounted(() => {
  hotspotStore.cleanHotspotState();
  resetEditState();
});
</script>
