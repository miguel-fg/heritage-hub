<template>
  <div v-if="toEdit" class="flex flex-col gap-10">
    <div class="flex flex-col-reverse md:flex-col gap-10">
      <CollapsableFormSection name="Object Information" default-open>
        <div class="flex flex-col gap-6 w-full">
          <InputField
            v-model="toEdit.name"
            :error="nameError"
            fieldId="name"
            label="Name"
            mandatory
          />
          <InputField
            v-model="toEdit.caption"
            :error="captionError"
            fieldId="caption"
            label="Caption"
            mandatory
          />
          <TextArea
            v-model="toEdit.description"
            fieldId="description"
            label="Description"
            mandatory
            :error="descriptionError"
          />
          <InputField
            v-model="toEdit.accNum"
            fieldId="accNum"
            label="Accession Number"
          />
        </div>
      </CollapsableFormSection>
      <ModelSettings editing />
    </div>
    <div class="flex flex-col gap-10">
      <div class="w-full">
        <CollapsableFormSection name="Filters">
          <div class="flex flex-col gap-3">
            <Multiselect
              fieldId="materials"
              label="Materials"
              v-model="toEdit.materials"
              editing
            />
            <Multiselect
              fieldId="tags"
              label="Tags"
              v-model="toEdit.tags"
              editing
            />
          </div>
        </CollapsableFormSection>
      </div>
      <div v-if="dimensionsLoaded">
        <CollapsableFormSection name="Dimensions">
          <DimensionsField />
        </CollapsableFormSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEdit } from "../../scripts/useEdit";
import InputField from "../InputField.vue";
import TextArea from "../TextArea.vue";
import Multiselect from "../Multiselect.vue";
import CollapsableFormSection from "../upload/CollapsableFormSection.vue";
import DimensionsField from "../DimensionsField.vue";
import ModelSettings from "../upload/ModelSettings.vue";
import { useDimensions } from "../../scripts/useDimensions";
import { onMounted, ref } from "vue";

const { toEdit, nameError, captionError, descriptionError } = useEdit();

const { dbToRecord } = useDimensions();

const dimensionsLoaded = ref(false);

onMounted(() => {
  if (toEdit.value) {
    dbToRecord(toEdit.value.dimensions);
  }

  dimensionsLoaded.value = true;
});
</script>
