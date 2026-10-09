<template>
  <strong class="font-poppins text-primary-500 text-xl mb-5"
    >Confirm files</strong
  >
  <div
    class="flex flex-col w-full h-[300px] overflow-y-auto overflow-x-hidden divide-y-1 divide-grayscale-300"
  >
    <div v-for="file in props.files" :key="file.id">
      <div v-if="file.type === 'image'" class="flex gap-2 items-center py-2">
        <div class="shrink-0 grow-0 size-10">
          <img
            v-if="file.previewUrl"
            :src="file.previewUrl"
            alt="image thumbnail"
            class="w-full h-full object-contain"
          />
          <Icon v-else icon="bx:image" class="size-full text-grayscale-500" />
        </div>
        <div class="grow-1 min-w-0">
          <strong class="font-poppins text-grayscale-700 block truncate">{{
            file.label ?? file.file.name
          }}</strong>
          <p class="body truncate">{{ file.description }}</p>
        </div>
      </div>
      <div v-else class="flex gap-2 items-center py-2">
        <div class="shrink-0 grow-0 size-10">
          <Icon icon="vscode-icons:file-type-pdf2" class="size-full" />
        </div>
        <strong class="font-poppins text-grayscale-700 min-w-0 truncate">{{
          file.file.name
        }}</strong>
      </div>
    </div>
  </div>
  <div class="flex gap-5 w-full mt-5">
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
      @click="emit('confirm')"
      type="success"
      class="grow-1 justify-center"
      >Confirm</Button
    >
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { Icon } from '@iconify/vue'
import { type ProcessedFile } from '../types/media'

const props = defineProps<{ files: ProcessedFile[] }>()
const emit = defineEmits(['confirm', 'back', 'cancel'])
</script>
