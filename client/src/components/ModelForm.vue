<template>
  <div class="flex flex-col md:flex-row gap-16">
    <div class="flex flex-col gap-6 w-full">
      <InputField
        v-model="mName"
        :error="nameError"
        fieldId="name"
        label="Name"
        mandatory
      />
      <InputField
        v-model="mCaption"
        :error="captionError"
        fieldId="caption"
        label="Caption"
        mandatory
      />
      <TextArea fieldId="description" label="Description" mandatory />
      <InputField v-model="mAccNum" fieldId="accNum" label="Accession Number" />
      <span class="tag text-grayscale-600"
        >Fields marked with * are mandatory</span
      >
    </div>
    <div class="flex flex-col w-full md:w-3/7 gap-12">
      <div class="flex flex-col gap-6">
        <Multiselect
          fieldId="materials"
          label="Materials"
          v-model="selectedMaterials"
        />
        <Multiselect fieldId="tags" label="Tags" v-model="selectedTags" />
      </div>
      <DimensionsField />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputField from "./InputField.vue";
import TextArea from "./TextArea.vue";
import DimensionsField from "./DimensionsField.vue";
import Multiselect from "./Multiselect.vue";
import { useUpload } from "../scripts/useUpload";
import { watch } from "vue";

const {
  mName,
  mCaption,
  mAccNum,
  nameError,
  captionError,
  selectedTags,
  selectedMaterials,
  validateField,
} = useUpload();

watch(mName, () => {
  validateField("Name");
});

watch(mCaption, () => {
  validateField("Caption");
});
</script>
