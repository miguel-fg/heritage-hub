<template>
  <UploadModal />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import UploadModal from "../components/upload/UploadModal.vue";
import { useUpload } from "../scripts/useUpload";

const { resetUploadState } = useUpload();

onMounted(() => {
  resetUploadState();
});

onUnmounted(() => {
  resetUploadState();
});
</script>
