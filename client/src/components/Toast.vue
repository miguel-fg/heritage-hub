<template>
  <div class="flex align-center w-max p-3 gap-3 rounded-xs" :class="toastStyle">
    <img :src="imgSrc" alt="Toast icon" />
    <span class="tag">{{ props.message }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  type: { type: String, required: true },
  message: { type: String, required: true },
});

const imgSrc = computed(() => {
  switch (props.type) {
    case "success":
      return "../../assets/icons/success.svg";
    case "error":
      return "../../assets/icons/error.svg";
  }
});

const toastStyle = computed(() => {
  switch (props.type) {
    case "success":
      return "bg-success-100 text-success-800 border border-success-500";
    case "error":
      return "bg-danger-100 text-danger-800 border border-danger-500";
  }
});
</script>
