<template>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave="toggleActive"
    @dragover.prevent
    @drop.prevent="handleDrop"
    :class="active ? 'bg-grayscale-300 border-grayscale-500' : ''"
    class="flex justify-center items-center w-full h-148 px-3 border-2 border-grayscale-400 bg-grayscale-200 rounded-xs hover:bg-grayscale-300 hover:border-grayscale-500"
  >
    <label
      for="objectInput"
      class="flex flex-col gap-3 w-full h-full justify-center items-center cursor-pointer"
    >
      <img
        src="../../assets/icons/object-placeholder.svg"
        alt="Object placeholder icon"
      />
      <p class="font-poppins text-grayscale-800 text-pretty text-center">
        Click to choose a
        <span class="font-bold">.glb / .gltf</span>
        file or drag and drop it here.
      </p>
    </label>
    <input
      type="file"
      name="object"
      id="objectInput"
      accept=".glb"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
  <div class="flex gap-3 w-full justify-end mt-4">
    <Button type="secondary" @click="emit('cancel')">Cancel</Button>
    <Button type="primary" @click="uploadClick">Upload</Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "./Button.vue";

const file = defineModel({
  default: {
    name: "",
    size: 0,
    extention: "",
  },
});

const emit = defineEmits(["update", "cancel"]);

const active = ref(false);

const toggleActive = () => {
  active.value = !active.value;
};

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
  }

  emit("update");
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

    emit("update");
  }
};

const uploadClick = () => {
  const fileInput = document.getElementById("objectInput");

  if (fileInput) {
    fileInput.click();
  }
};
</script>
