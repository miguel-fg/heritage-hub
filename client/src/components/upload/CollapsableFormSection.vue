<template>
  <div class="flex flex-col w-full gap-3" :class="props.class">
    <button
      @click="toggleSection"
      class="flex justify-between items-center text-primary-500 cursor-pointer active:bg-grayscale-200 hover:text-primary-700 hover:border-b hover:border-primary-300"
    >
      <h1 class="title">{{ props.name }}</h1>
      <ChevronIcon v-show="!sectionOpen" />
      <MinusIcon v-show="sectionOpen" />
    </button>
    <div v-show="sectionOpen">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChevronIcon from "../icons/ChevronIcon.vue";
import MinusIcon from "../icons/MinusIcon.vue";

const props = defineProps<{
  name: string;
  defaultOpen?: boolean;
  class?: string;
}>();

const sectionOpen = ref<boolean>(props.defaultOpen ?? false);

const toggleSection = () => {
  sectionOpen.value = !sectionOpen.value;
};
</script>
