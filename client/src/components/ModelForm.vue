<template>
  <div class="flex flex-col gap-10">
    <div class="flex flex-col-reverse md:flex-col gap-10">
      <CollapsableFormSection name="Object Information" default-open>
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
          <TextArea
            v-model="mDescription"
            fieldId="description"
            label="Description"
            mandatory
            :error="descriptionError"
          />
          <InputField
            v-model="mAccNum"
            fieldId="accNum"
            label="Accession Number"
          />
        </div>
      </CollapsableFormSection>
      <ModelSettings />
    </div>
    <div class="flex flex-col gap-10">
      <div class="w-full">
        <CollapsableFormSection name="Filters">
          <div class="flex flex-col gap-3">
            <Multiselect
              fieldId="materials"
              label="Materials"
              v-model="selectedMaterials"
            />
            <Multiselect fieldId="tags" label="Tags" v-model="selectedTags" />
          </div>
        </CollapsableFormSection>
      </div>
      <div>
        <CollapsableFormSection name="Dimensions">
          <DimensionsField />
        </CollapsableFormSection>
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
import CollapsableFormSection from "./upload/CollapsableFormSection.vue";
import ModelSettings from "./upload/ModelSettings.vue";

const {
  mName,
  mCaption,
  mAccNum,
  nameError,
  captionError,
  mDescription,
  descriptionError,
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

watch(mDescription, () => {
  validateField("Description");
});
</script>
