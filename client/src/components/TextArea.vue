<template>
  <div class="flex flex-col w-full">
    <label :for="props.fieldId" class="subtitle text-grayscale-700">{{
      props.label + mandatory
    }}</label>
    <textarea
      name="description"
      v-model="model"
      :rows="`${props.rows}`"
      :id="props.fieldId"
      class="px-2 py-1 bg-white rounded-xs body resize-none"
      :class="
        props.error && displayError
          ? 'border-2 border-danger-300'
          : 'border border-grayscale-300'
      "
    ></textarea>
    <span v-if="displayError" class="tag text-danger-600">{{
      props.error
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUpload } from "../scripts/useUpload";

const props = defineProps<{
  fieldId: string;
  label:
    | "Name"
    | "Caption"
    | "Description"
    | "Content"
    | "Label"
    | "Provenance";
  mandatory?: boolean;
  error?: string | null;
  showError?: boolean;
  rows: number;
}>();

const model = defineModel<string>();

const { uploadAttempted } = useUpload();

const mandatory = computed(() => (props.mandatory ? "*" : ""));
const displayError = computed(() => uploadAttempted || props.showError);
</script>
