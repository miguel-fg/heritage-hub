<template>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave="toggleActive"
    @dragover.prevent
    @drop.prevent="handleDrop"
    :class="zoneActive ? 'bg-grayscale-200' : ''"
    class="flex justify-center items-center w-full min-h-40 border-2 border-dashed border-primary-600 rounded-sm mb-5 p-5"
  >
    <label
      for="mediaInput"
      class="flex flex-col gap-2 w-full h-full justify-center items-center cursor-pointer text-grayscale-900 font-poppins"
    >
      <Icon
        icon="bx:cloud-upload"
        width="48"
        height="48"
        class="text-grayscale-700"
      />
      <span>Drag and Drop your files</span>
      <span>or</span>
      <span
        class="font-medium cursor-pointer rounded-xs px-2 py-1 bg-primary-500 text-grayscale-100 drop-shadow-sm hover:bg-primary-600 active:bg-primary-800"
        >Browse</span
      >
      <input
        type="file"
        name="media"
        id="mediaInput"
        class="hidden"
        multiple
        accept="image/*,.pdf"
        @change="handleFileChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const emit = defineEmits<{ files: [files: File[]] }>()

const ACCEPTED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

const zoneActive = ref(false)
const toggleActive = () => {
  zoneActive.value = !zoneActive.value
}

const processFiles = (raw: FileList) => {
  const valid = Array.from(raw).filter((f) => ACCEPTED.includes(f.type))
  if (valid.length) emit('files', valid)
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement

  if (input.files) processFiles(input.files)
}

const handleDrop = async (e: DragEvent) => {
  toggleActive()

  if (e.dataTransfer?.files.length) processFiles(e.dataTransfer.files)
}
</script>
