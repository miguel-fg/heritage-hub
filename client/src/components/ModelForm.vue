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
      <Multiselect label="Materials" v-model="selectedMaterials" />
      <Multiselect label="Tags" v-model="selectedTags" />
    </div>
  </div>
  <div class="flex w-full justify-end gap-2">
    <Button type="secondary" @click="handleCancel">Cancel</Button>
    <Button type="success" @click="handleUpload" :disabled="loading"
      >Publish</Button
    >
  </div>
</template>

<script setup lang="ts">
import InputField from "./InputField.vue";
import TextArea from "./TextArea.vue";
import Button from "./Button.vue";
import DimensionsField from "./DimensionsField.vue";
import Multiselect from "./Multiselect.vue";
import { useUpload } from "../scripts/useUpload";
import { useToastStore } from "../stores/toastStore";
import { watch } from "vue";

const emit = defineEmits(["publish", "cancel"]);

const {
  mName,
  mCaption,
  nameError,
  captionError,
  selectedTags,
  selectedMaterials,
  validateField,
  isValid,
  validateForm,
  uploadAttempted,
  loading,
} = useUpload();

const toastStore = useToastStore();

const handleUpload = () => {
  uploadAttempted.value = true;
  validateForm();
  if (!isValid.value) {
    toastStore.showToast("error", "Failed to publish the model.");
    return;
  }

  emit("publish");
};

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
