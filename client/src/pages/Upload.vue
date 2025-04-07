<template>
  <div class="flex gap-5 mx-auto mt-28 mb-32 max-w-[1920px]">
    <div v-if="fileSelected" class="flex gap-8 w-full">
      <div class="flex flex-col w-1/3">
        <h1 class="title text-grayscale-900">File Name: {{ file.name }}</h1>
        <h2 class="subtitle text-grayscale-900">File Size: {{ file.size }}</h2>
        <h2 class="subtitle text-grayscale-900">
          File Extention: {{ file.extention }}
        </h2>
        <Button type="secondary" @click="clearFile">Re-upload Model</Button>
        <div>{{ modelId }}</div>
      </div>
      <div class="flex flex-col gap-6 w-2/3">
        <ModelForm />
      </div>
    </div>
    <div v-else class="w-full flex flex-col justify-center">
      <Dropzone
        v-model="file"
        @update="() => (fileSelected = true)"
        @cancel="cancelUpload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { v4 as uuidv4, type UUIDTypes } from "uuid";
import { useRouter } from "vue-router";
import Button from "../components/Button.vue";
import Dropzone from "../components/Dropzone.vue";
import ModelForm from "../components/ModelForm.vue";

const fileSelected = ref(false);

const modelId = ref<UUIDTypes | null>(null);
const file = ref({
  name: "",
  size: 0,
  extention: "",
});

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

onMounted(() => {
  modelId.value = uuidv4();
});

onUnmounted(() => {
  modelId.value = null;
});
</script>
