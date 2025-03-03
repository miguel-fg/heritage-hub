<template>
  <div class="flex gap-5 mx-auto mt-28 mb-32 max-w-[1920px]">
    <div v-if="fileSelected">
      <h1 class="title text-grayscale-900">File Name: {{ file.name }}</h1>
      <h2 class="subtitle text-grayscale-900">File Size: {{ file.size }}</h2>
      <h2 class="subtitle text-grayscale-900">
        File Extention: {{ file.extention }}
      </h2>
      <Button type="secondary" @click="clearFile">Re-upload Model</Button>
    </div>
    <div v-else class="w-full flex flex-col justify-center">
      <div
        @dragenter.prevent="toggleActive"
        @dragleave.prevent="toggleActive"
        @dragover.prevent
        @drop.prevent="handleDrop"
        :class="active ? 'bg-grayscale-300 border-grayscale-500' : ''"
        class="flex justify-center items-center w-full h-148 px-3 border-2 border-grayscale-400 bg-grayscale-200 rounded-xs hover:bg-grayscale-300 hover:border-grayscale-500"
      >
        <label
          class="flex flex-col gap-3 w-full h-full justify-center items-center cursor-pointer"
          for="objectInput"
        >
          <img
            src="../../assets/icons/object-placeholder.svg"
            alt="Object placeholder icon"
          />
          <p class="font-poppins text-grayscale-800 text-pretty text-center">
            Click to choose a <span class="font-bold">.glb / .gltf</span> file
            or drag and drop it here.
          </p>
        </label>
        <input
          type="file"
          name="object"
          id="objectInput"
          accept=".glb"
          class="hidden"
          @change="(e) => handleFileChange(e)"
        />
      </div>

      <div class="flex gap-3 w-full justify-end mt-4">
        <Button type="secondary" @click="cancelUpload">Cancel</Button>
        <Button type="primary" @click="uploadClick">Upload</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Button from "../components/Button.vue";

const active = ref(false);

const toggleActive = () => {
  active.value = !active.value;
};

const fileSelected = ref(false);

const file = ref({
  name: "",
  size: 0,
  extention: "",
});

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const targetFile = target.files[0];

    const fileSize = Math.round((targetFile.size / 1024 / 1024) * 100) / 100;
    const fileExtention = targetFile.name.split(".").pop();
    const fileName = targetFile.name.split(".").shift();

    file.value.name = fileName || "";
    file.value.size = fileSize;
    file.value.extention = fileExtention || "";

    fileSelected.value = true;
  }
};

const handleDrop = (e: DragEvent) => {
  toggleActive();

  if (e.dataTransfer && e.dataTransfer.files[0]) {
    const targetFile = e.dataTransfer.files[0];

    const fileSize = Math.round((targetFile.size / 1024 / 1024) * 100) / 100;
    const fileExtention = targetFile.name.split(".").pop();
    const fileName = targetFile.name.split(".").shift();

    file.value.name = fileName || "";
    file.value.size = fileSize;
    file.value.extention = fileExtention || "";

    fileSelected.value = true;
  }
};

const uploadClick = () => {
  const fileInput = document.getElementById("objectInput");

  if (fileInput) {
    fileInput.click();
  }
};

const clearFile = () => {
  fileSelected.value = false;
  file.value = {
    name: "",
    size: 0,
    extention: "",
  };
};

const router = useRouter();

const cancelUpload = () => {
  router.push("/");
};
</script>
