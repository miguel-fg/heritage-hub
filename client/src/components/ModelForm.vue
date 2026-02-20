<template>
  <div class="flex flex-col gap-10 min-h-[700px]">
    <div
      v-show="computedSection === 1"
      class="flex flex-col-reverse md:flex-col gap-4"
    >
      <h1 class="title text-primary-500">Object Information</h1>
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
          label="Description (at least 20 characters long)"
          mandatory
          :error="descriptionError"
          :rows="5"
        />
        <div class="h-2"></div>
        <InputField
          v-model="mAccNum"
          fieldId="accNum"
          label="Accession Number"
        />
        <TextArea
          v-model="mProvenance"
          fieldId="provenance"
          label="Provenance"
          :rows="3"
        />
      </div>
    </div>
    <div v-show="computedSection === 2">
      <ModelSettings />
    </div>
    <div v-show="computedSection === 3" class="flex flex-col gap-10">
      <div class="w-full">
        <h1 class="title text-primary-500 mb-4">Filters</h1>
        <div class="flex flex-col gap-3">
          <Multiselect
            fieldId="materials"
            label="Materials"
            v-model="selectedMaterials"
          />
          <Multiselect fieldId="tags" label="Tags" v-model="selectedTags" />
        </div>
      </div>
      <div>
        <h1 class="title text-primary-500 mb-4">Dimensions</h1>
        <DimensionsField />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputField from './InputField.vue'
import TextArea from './TextArea.vue'
import DimensionsField from './DimensionsField.vue'
import Multiselect from './Multiselect.vue'
import { useUpload } from '../scripts/useUpload'
import { watch, computed } from 'vue'
import ModelSettings from './upload/ModelSettings.vue'

const props = defineProps<{
  section: number
}>()

const computedSection = computed(() => props.section)

const {
  mName,
  mCaption,
  mAccNum,
  mProvenance,
  nameError,
  captionError,
  mDescription,
  descriptionError,
  selectedTags,
  selectedMaterials,
  validateField,
} = useUpload()

watch(mName, () => {
  validateField('Name')
})

watch(mCaption, () => {
  validateField('Caption')
})

watch(mDescription, () => {
  validateField('Description')
})
</script>
