<template>
  <label :for="props.label" class="flex items-center cursor-pointer">
    <input :id="props.label" type="checkbox" v-model="checked" class="hidden" />
    <div
      class="w-9 h-5 p-1 bg-grayscale-300 hover:bg-grayscale-400 rounded-sm transition-colors duration-100"
      :class="{ 'bg-primary-400 hover:bg-primary-500': checked }"
    >
      <div
        class="w-3 h-3 bg-white rounded-xs transform transition-transform duration-200"
        :class="{ 'translate-x-4': checked }"
      ></div>
    </div>

    <span></span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps({
  label: { type: String, required: true },
});

const checked = defineModel<boolean>();
</script>
