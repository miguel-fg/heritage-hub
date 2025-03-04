<template>
  <div class="flex flex-col w-full">
    <label :for="props.fieldId" class="subtitle text-primary-500">{{
      props.label
    }}</label>
    <textarea
      name="description"
      :id="props.fieldId"
      class="px-2 py-1 bg-white rounded-xs body border border-grayscale-300"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
});
</script>
