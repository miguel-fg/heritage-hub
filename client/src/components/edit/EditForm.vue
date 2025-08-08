<template>
  <div v-if="toEdit" class="flex flex-col gap-10 min-h-[700px]">
    <div
      v-show="computedSection === 1"
      class="flex flex-col-reverse md:flex-col gap-10"
    >
      <h1 class="title text-primary-500">Object Information</h1>
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
          :rows="5"
        />
        <div class="h-2"></div>
        <InputField
          v-model="toEdit.accNum"
          fieldId="accNum"
          label="Accession Number"
        />
        <TextArea
          v-model="toEdit.provenance"
          fieldId="provenance"
          label="Provenance"
          :rows="3"
        />
      </div>
    </div>
    <div v-show="computedSection === 2">
      <ModelSettings editing />
    </div>
    <div v-show="computedSection === 3" class="flex flex-col gap-10">
      <div class="w-full">
        <h1 class="title text-primary-500 mb-4">Filters</h1>
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
      </div>
      <div v-if="dimensionsLoaded">
        <h1 class="title text-primary-500 mb-4">Dimensions</h1>
        <DimensionsField />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEdit } from "../../scripts/useEdit";
import InputField from "../InputField.vue";
import TextArea from "../TextArea.vue";
import Multiselect from "../Multiselect.vue";
import DimensionsField from "../DimensionsField.vue";
import ModelSettings from "../upload/ModelSettings.vue";
import { useDimensions } from "../../scripts/useDimensions";
import { computed, onMounted, ref } from "vue";

const { toEdit, nameError, captionError, descriptionError } = useEdit();

const props = defineProps<{
  section: number;
}>();

const computedSection = computed(() => props.section);

const { dbToRecord } = useDimensions();

const dimensionsLoaded = ref(false);

onMounted(() => {
  if (toEdit.value) {
    dbToRecord(toEdit.value.dimensions);
  }

  dimensionsLoaded.value = true;
});
</script>
