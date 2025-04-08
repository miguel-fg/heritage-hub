<template>
  <InputField v-model="mName" :error="nameError" fieldId="name" label="Name" />
  <InputField
    v-model="mCaption"
    :error="captionError"
    fieldId="caption"
    label="Caption"
  />
  <TextArea fieldId="description" label="Description" />
  <div class="flex justify-between">
    <DimensionsField />
    <div class="flex flex-col w-7/10 gap-8">
      <Multiselect label="Materials" />
      <Multiselect label="Tags" />
    </div>
  </div>
  <div class="flex w-full justify-end gap-2">
    <Button type="secondary" @click="handleCancel">Cancel</Button>
    <Button type="primary" @click="uploadAttempted = true">Validate</Button>
  </div>
</template>

<script setup lang="ts">
import InputField from "./InputField.vue";
import TextArea from "./TextArea.vue";
import Button from "./Button.vue";
import DimensionsField from "./DimensionsField.vue";
import Multiselect from "./Multiselect.vue";
import { useUpload } from "../scripts/useUpload";
import { watch } from "vue";

const emit = defineEmits(["cancel"]);

const {
  mName,
  mCaption,
  nameError,
  captionError,
  validateField,
  uploadAttempted,
} = useUpload();

const handleCancel = () => {
  uploadAttempted.value = false;
  emit("cancel");
};

watch(mName, () => {
  validateField("Name");
});

watch(mCaption, () => {
  validateField("Caption");
});
</script>
