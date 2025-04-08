<template>
  <div class="flex gap-5 mx-auto mt-28 mb-32 max-w-[1920px]">
    <div v-if="fileSelected" class="flex gap-8 w-full">
      <div class="flex flex-col w-1/3 gap-2 items-end">
        <div
          class="w-full h-120 lg:h-100 max-h-[450px] bg-white flex justify-center items-center"
        >
          <ThreeVisualizer
            v-if="uploadSuccess && modelId"
            :modelId="modelId"
            editing
          />
          <div v-else-if="uploadLoading" role="status">
            <svg
              aria-hidden="true"
              class="inline w-20 h-20 text-grayscale-200 animate-spin fill-primary-500"
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
            <span class="sr-only">Uploading 3D model...</span>
          </div>
        </div>
        <Button type="secondary" @click="reUploadFile">Re-upload Model</Button>
      </div>
      <div class="flex flex-col gap-6 w-2/3">
        <ModelForm @cancel="cancelUpload" />
      </div>
    </div>
    <div v-else class="w-full flex flex-col justify-center">
      <Dropzone
        v-model="file"
        @update="handleFileUpdate"
        @cancel="cancelUpload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import Button from "../components/Button.vue";
import Dropzone from "../components/Dropzone.vue";
import ModelForm from "../components/ModelForm.vue";
import ThreeVisualizer from "../components/three/ThreeVisualizer.vue";
import axiosInstance from "../scripts/axiosConfig";
import axios from "axios";

const fileSelected = ref(false);

const modelId = ref<string | null>(null);
const file = ref<File | null>(null);

const uploadLink = ref<string | null>(null);
const uploadLoading = ref(false);
const uploadSuccess = ref(false);

const resetState = () => {
  fileSelected.value = false;
  file.value = null;
  modelId.value = null;
  uploadLink.value = null;
  uploadSuccess.value = false;
};

const reUploadFile = async () => {
  if (uploadSuccess.value) {
    console.log("Calling cleanup!");
    await cleanupTempUpload();
  }

  resetState();
};

const handleFileUpdate = async () => {
  if (!file.value) return;
  uploadLoading.value = true;
  modelId.value = uuidv4();

  fileSelected.value = true;

  try {
    uploadLink.value = await getObjectUploadUrl(modelId.value);

    if (uploadLink.value) {
      uploadSuccess.value = await uploadModeltoR2(file.value, uploadLink.value);

      if (uploadSuccess) {
        console.log("File uploaded successfully!");
      }
    }
  } catch (error) {
    console.error("File upload process failed: ", error);
  } finally {
    uploadLoading.value = false;
  }
};

const getObjectUploadUrl = async (modelId: string) => {
  try {
    const response = await axiosInstance.post(`/models/upload-url`, {
      modelId,
    });

    const newUrl = response.data.uploadUrl;

    return newUrl;
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

const router = useRouter();

const cancelUpload = async () => {
  if (uploadSuccess.value) {
    await cleanupTempUpload();
  }

  resetState();
  router.push("/");
};

const cleanupTempUpload = async () => {
  if (!modelId.value) return;

  try {
    await axiosInstance.delete(`/models/${modelId.value}`, {
      params: { temp: true },
    });
    console.log("Temporary file deleted successfully");
  } catch (error) {
    console.error("Failed to delete temporary file: ERR: ", error);
  }
};

onUnmounted(async () => {
  if (uploadSuccess.value && modelId.value) {
    await cleanupTempUpload();
  }
});
</script>
