<template>
  <div
    class="flex px-3 py-2 rounded-xs border gap-2 font-poppins text-xs"
    :class="containerStyle"
  >
    <img :src="iconSrc" alt="Message icon" />
    <div class="flex flex-col gap-1">
      <p class="font-medium" :class="titleStyle"><slot name="title" /></p>
      <p :class="contentStyle"><slot name="content" /></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type MessageType } from "../types/ui";

const props = defineProps<{
  type: MessageType;
}>();

const containerStyle = computed(() => {
  switch (props.type) {
    case "info":
      return "bg-info-100 border-info-600";

    case "warning":
      return "bg-warning-100 border-warning-600";

    case "danger":
      return "bg-danger-100 border-danger-600";
  }
});

const titleStyle = computed(() => {
  switch (props.type) {
    case "info":
      return "text-info-800";
    case "warning":
      return "text-warning-800";
    case "danger":
      return "text-danger-800";
  }
});

const contentStyle = computed(() => {
  switch (props.type) {
    case "info":
      return "text-info-900";
    case "warning":
      return "text-warning-900";
    case "danger":
      return "text-danger-900";
  }
});

const iconSrc = computed(() => {
  switch (props.type) {
    case "info":
      return "../../assets/icons/info.svg";

    case "warning":
      return "../../assets/icons/warning.svg";

    case "danger":
      return "../../assets/icons/error.svg";
  }
});
</script>
