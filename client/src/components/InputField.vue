<template>
  <div class="flex flex-col w-full gap-1">
    <label :for="props.fieldId" class="subtitle text-primary-500">{{
      props.label
    }}</label>
    <input
      type="text"
      :id="props.fieldId"
      class="px-2 py-1 bg-white rounded-xs body"
      :class="
        error && uploadAttempted
          ? 'border-2 border-danger-300'
          : 'border border-grayscale-300'
      "
      v-model="model"
      autocomplete="off"
    />
    <span v-if="uploadAttempted" class="tag text-danger-600">{{
      props.error
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { useUpload } from "../scripts/useUpload";
const props = defineProps<{
  fieldId: string;
  label: "Name" | "Caption" | "Description";
  error: string | null;
}>();

const model = defineModel();
const { uploadAttempted } = useUpload();
</script>
