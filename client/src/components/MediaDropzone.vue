<template>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave="toggleActive"
    @dragover.prevent
    @drop.prevent="handleDrop"
    :class="zoneActive ? 'bg-grayscale-200' : ''"
    class="flex justify-center items-center w-full min-h-40 border-2 border-dashed border-primary-600 rounded-sm p-5"
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
import { useToastStore } from '../stores/toastStore'
import { validateFileType } from '../scripts/fileValidator'

const emit = defineEmits<{ files: [files: File[]] }>()

const toastStore = useToastStore()

const zoneActive = ref(false)
const toggleActive = () => {
  zoneActive.value = !zoneActive.value
}

const processFiles = async (raw: FileList) => {
  const filesArray = Array.from(raw)

  const validFiles: File[] = []
  let rejectedCount = 0

  for (const file of filesArray) {
    const isValid = await validateFileType(file)
    if (isValid) {
      validFiles.push(file)
    } else {
      rejectedCount++
    }
  }

  if (rejectedCount > 0) {
    toastStore.showToast(
      'error',
      `${rejectedCount} file(s) rejected: Invalid or corrupted format.`,
    )
  }

  if (validFiles.length) {
    emit('files', validFiles)
  }
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement

  if (input.files) processFiles(input.files)

  input.value = ''
}

const handleDrop = async (e: DragEvent) => {
  zoneActive.value = false

  if (e.dataTransfer?.files.length) {
    await processFiles(e.dataTransfer.files)
  }
}
</script>
