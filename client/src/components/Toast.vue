<template>
  <div
    class="flex align-center items-center w-max p-3 gap-2 rounded-xs shadow-md"
    :class="toastStyle"
  >
    <Icon :icon="props.type === 'success' ? 'bx:check' : 'bx:x'" width="24" />
    <span class="font-poppins font-medium">{{ props.message }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  type: "success" | "error";
  message: string;
}>();

const toastStyle = computed(() => {
  switch (props.type) {
    case "success":
      return "bg-success-600 text-white border border-success-500";
    case "error":
      return "bg-danger-600 text-white border border-danger-500";
  }
});
</script>
