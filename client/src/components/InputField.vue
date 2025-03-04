<template>
  <div class="flex flex-col w-full">
    <label :for="props.fieldId" class="subtitle text-primary-500">{{
      props.label
    }}</label>
    <input
      type="text"
      :id="props.fieldId"
      class="px-2 py-1 bg-white rounded-xs body border border-grayscale-300"
    />
    <span></span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
});
</script>
