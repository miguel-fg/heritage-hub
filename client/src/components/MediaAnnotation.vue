<template>
  <strong class="font-poppins text-primary-500 text-xl mb-1"
    >Image {{ props.progress }}</strong
  >
  <div v-if="current.previewUrl" class="w-full h-[300px] bg-white shadow-md">
    <img
      :src="current.previewUrl"
      :alt="current.label ?? 'image preview'"
      class="w-full h-full object-contain"
    />
  </div>
  <div class="flex flex-col my-10 gap-5">
    <div>
      <label for="media-label" class="font-bold text-grayscale-700"
        >Label</label
      >
      <input
        v-model="current.label"
        id="media-label"
        name="media-label"
        type="text"
        class="w-full px-2 py-1 bg-white rounded-xs body border border-grayscale-300"
      />
    </div>
    <div>
      <label for="media-description" class="font-bold text-grayscale-700"
        >Description</label
      >
      <textarea
        v-model="current.description"
        name="media-description"
        id="media-description"
        rows="3"
        class="w-full px-2 py-1 bg-white rounded-xs body border border-grayscale-300 resize-none"
      />
    </div>
  </div>
  <div class="flex gap-5 w-full">
    <Button
      @click="emit('cancel')"
      type="secondary"
      class="grow-1 justify-center"
      >Cancel</Button
    >
    <Button @click="emit('back')" type="secondary" class="grow-1 justify-center"
      >Back</Button
    >
    <Button
      @click="emit('continue')"
      type="success"
      class="grow-1 justify-center"
      >Continue</Button
    >
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { type ProcessedFile } from '../types/media'

const props = defineProps<{
  current: ProcessedFile
  progress: string
}>()

const emit = defineEmits(['continue', 'back', 'cancel'])
</script>
