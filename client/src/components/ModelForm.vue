<template>
  <div class="flex flex-col gap-6">
    <InputField
      v-model="mName"
      :error="nameError"
      fieldId="name"
      label="Name"
    />
    <InputField
      v-model="mCaption"
      :error="captionError"
      fieldId="caption"
      label="Caption"
    />
    <TextArea fieldId="description" label="Description" />
    <div class="flex sm:hidden flex-col gap-4 my-6">
      <Multiselect
        fieldId="materials-mobile"
        label="Materials"
        v-model="selectedMaterials"
      />
      <Multiselect fieldId="tags-mobile" label="Tags" v-model="selectedTags" />
    </div>
    <div class="flex justify-between gap-8 xl:gap-12">
      <DimensionsField />
      <div class="hidden sm:flex flex-col w-7/10 justify-between">
        <div class="flex flex-col gap-8">
          <Multiselect
            fieldId="materials-desktop"
            label="Materials"
            v-model="selectedMaterials"
          />
          <Multiselect
            fieldId="tags-desktop"
            label="Tags"
            v-model="selectedTags"
          />
        </div>
      </div>
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
