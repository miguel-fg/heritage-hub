<template>
  <div class="w-full @container">
    <div
      class="min-h-screen flex gap-5 mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <div
        v-if="fileSelected && !publishing"
        class="flex flex-col lg:flex-row gap-8 w-full"
      >
        <div class="flex flex-col w-full lg:w-1/2 gap-2 items-end">
          <h1 class="subtitle text-primary-500 w-full">Preview</h1>
          <div
            class="w-full h-120 lg:h-100 max-h-[450px] bg-white flex justify-center items-center"
          >
            <ThreeVisualizer
              v-if="modelId && file"
              :modelId="modelId"
              editing
              :fileRef="file"
            />
          </div>
          <div v-if="thumbnail" class="flex flex-col w-full gap-2 mt-8">
            <h1 class="subtitle text-primary-500 w-full">Thumbnail</h1>
            <img
              :src="thumbnail"
              alt="Model thumbnail preview"
              class="size-full max-w-64 rounded-xs shadow-sm"
            />
          </div>
        </div>
        <div class="flex flex-col gap-6 w-full lg:w-1/2">
          <ModelForm @publish="handlePublish" @cancel="cancelUpload" />
        </div>
      </div>
      <div
        v-else-if="fileSelected && publishing"
        class="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col gap-12 items-center"
        role="status"
      >
        <svg
          aria-hidden="true"
          class="inline w-30 h-30 text-grayscale-200 animate-spin fill-primary-500"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="title text-grayscale-900">Publishing 3D model...</span>
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
import ThreeVisualizer from "../components/three/ThreeVisualizer.vue";
import Footer from "../components/Footer.vue";
import { useModelStore } from "../stores/modelStore";
import { useDimensions } from "../scripts/useDimensions";
import { useHotspotStore } from "../stores/hotspotStore";
import { useToastStore } from "../stores/toastStore";
import { useUpload } from "../scripts/useUpload";
import axiosInstance from "../scripts/axiosConfig";
import axios from "axios";

const fileSelected = ref(false);

const modelId = ref<string | null>(null);
const file = ref<File | null>(null);

const publishing = ref(false);

const modelStore = useModelStore();
const toastStore = useToastStore();

const { dimensions: dimensionsState } = useDimensions();
const { thumbnail, dimensions, sanitizeDimensions, hotspots, publishModel } =
  useUpload();

const hotspotStore = useHotspotStore();
const { hotspots: hotspotState } = storeToRefs(hotspotStore);

const resetState = () => {
  fileSelected.value = false;
  file.value = null;
  modelId.value = null;
  publishing.value = false;
};

const handleFileUpdate = async () => {
  if (!file.value) return;

  modelId.value = uuidv4();
  fileSelected.value = true;
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
    return;
  }
  console.log("[Upload.vue] SUCCESS");

  // Database write
  console.log("[Upload.vue] Writing model data to database...");
  dimensions.value = sanitizeDimensions(dimensionsState.value);
  hotspots.value = hotspotState.value; // Missing sanitazion

  const success = await publishModel(modelId.value);

  if (!success) {
    toastStore.showToast("error", "Failed to publish model");
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
