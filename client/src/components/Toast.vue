<template>
  <div
    class="flex align-center items-center w-max p-3 gap-3 rounded-xs"
    :class="toastStyle"
  >
    <SuccessIcon v-if="props.type === 'success'" :width="15" />
    <ErrorIcon v-else-if="props.type === 'error'" :width="13" :height="14" />
    <span class="tag">{{ props.message }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SuccessIcon from "./icons/SuccessIcon.vue";
import ErrorIcon from "./icons/ErrorIcon.vue";

const props = defineProps<{
  type: "success" | "error";
  message: string;
}>();

const toastStyle = computed(() => {
  switch (props.type) {
    case "success":
      return "bg-success-100 text-success-800 border border-success-500";
    case "error":
      return "bg-danger-100 text-danger-800 border border-danger-500";
  }
});
</script>
