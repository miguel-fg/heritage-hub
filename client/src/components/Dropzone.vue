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
      accept=".glb,model/gltf-binary"
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
import { useToastStore } from "../stores/toastStore";

const file = defineModel();

const emit = defineEmits(["update", "cancel"]);

const active = ref(false);

const toastStore = useToastStore();

const toggleActive = () => {
  active.value = !active.value;
};

const validateGLTFFile = async (targetFile: File): Promise<boolean> => {
  const fileName = targetFile.name.toLowerCase();

  if (fileName.endsWith(".gltf")) {
    try {
      const text = await targetFile.text();
      const json = JSON.parse(text);
      return json.asset && json.asset.version ? true : false;
    } catch (error) {
      return false;
    }
  } else if (fileName.endsWith(".glb")) {
    try {
      const buffer = await targetFile.arrayBuffer();
      const view = new DataView(buffer);
      const magic = view.getUint32(0, true);
      const version = view.getUint32(4, true);

      return magic === 0x46546c67 && version === 2;
    } catch (error) {
      return false;
    }
  }

  return false;
};

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files && target.files[0]) {
    const targetFile = target.files[0];

    const isValidFile = await validateGLTFFile(targetFile);

    if (!isValidFile) {
      toastStore.showToast(
        "error",
        "Invalid file type. Please upload a .glb/.gltf file.",
      );
      return;
    }

    file.value = targetFile;
    emit("update");
  }
};

const handleDrop = async (e: DragEvent) => {
  toggleActive();

  if (e.dataTransfer && e.dataTransfer.files[0]) {
    const targetFile = e.dataTransfer.files[0];

    const isValidFile = await validateGLTFFile(targetFile);
    if (!isValidFile) {
      toastStore.showToast(
        "error",
        "Invalid file type. Please upload a .glb/.gltf file.",
      );
      return;
    }

    file.value = targetFile;
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
