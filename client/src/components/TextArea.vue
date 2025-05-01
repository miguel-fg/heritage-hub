<template>
  <div class="flex flex-col w-full">
    <label :for="props.fieldId" class="subtitle text-grayscale-700">{{
      props.label
    }}</label>
    <textarea
      name="description"
      v-model="mDescription"
      :id="props.fieldId"
      class="px-2 py-1 bg-white rounded-xs body"
      :class="
        descriptionError && uploadAttempted
          ? 'border-2 border-danger-300'
          : 'border border-grayscale-300'
      "
    ></textarea>
    <span v-if="uploadAttempted" class="tag text-danger-600">{{
      descriptionError
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useUpload } from "../scripts/useUpload";
const props = defineProps<{
  fieldId: string;
  label: "Name" | "Caption" | "Description";
}>();

const { mDescription, descriptionError, uploadAttempted, validateField } =
  useUpload();

watch(mDescription, () => {
  validateField("Description");
});
</script>
