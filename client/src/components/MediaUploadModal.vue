<template>
  <Teleport to="body">
    <div
      v-if="props.visible"
      class="fixed flex justify-center items-center inset-0 z-200 bg-grayscale-900/70 px-4"
    >
      <div
        class="bg-grayscale-100 rounded-sm flex flex-col w-full max-w-[500px] px-8 py-4 font-poppins"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex gap-5 w-full pt-2 mb-5">
          <label
            for="attach"
            class="flex flex-col items-center w-full cursor-pointer gap-1 pb-2"
            :class="
              uploadType === 'attach'
                ? 'font-semibold text-primary-500 border-b-2 border-primary-500'
                : 'text-grayscale-500 hover:text-grayscale-800'
            "
          >
            <Icon icon="bx:image-add" width="24" height="24" />
            Attach
            <input
              v-model="uploadType"
              type="radio"
              id="attach"
              name="media-type"
              checked="true"
              value="attach"
              class="hidden"
            />
          </label>
          <label
            for="embed"
            class="flex flex-col items-center w-full cursor-pointer gap-1 pb-2"
            :class="
              uploadType === 'embed'
                ? 'font-semibold text-primary-500 border-b-2 border-primary-500'
                : 'text-grayscale-500 hover:text-grayscale-800'
            "
          >
            <Icon icon="bx:link" width="24" height="24" />
            Embed
            <input
              v-model="uploadType"
              type="radio"
              id="embed"
              name="media-type"
              value="embed"
              class="hidden"
            />
          </label>
        </div>
        <MediaDropzone @files="processFiles" />
        <div
          v-if="fileList.length"
          class="flex flex-col max-h-62 overflow-y-auto mb-5 gap-3"
        >
          <MediaListItem
            v-for="entry in fileList"
            :file="entry.file"
            :progress="entry.progress"
            :error="entry.error"
          />
        </div>
        <div class="flex gap-5 w-full">
          <Button
            @click="handleCancel"
            type="secondary"
            class="grow-1 justify-center"
            >Cancel</Button
          >
          <Button
            @click="handleConfirm"
            type="success"
            :disabled="!allReady"
            class="grow-1 justify-center"
            >Confirm</Button
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Button from './Button.vue'
import MediaDropzone from './MediaDropzone.vue'
import MediaListItem from './MediaListItem.vue'
import { v4 as uuid } from 'uuid'
import axiosInstance from '../scripts/axiosConfig'

const props = defineProps<{
  visible?: boolean
  modelId: string
}>()
const emit = defineEmits(['cancel', 'done'])
const uploadType = ref<'attach' | 'embed'>('attach')

interface ProcessedFile {
  id: string
  file: File
  progress: number
  error: boolean
  alt?: string
}

const fileList = ref<ProcessedFile[]>([])

const uploadFile = (entry: ProcessedFile): Promise<void> => {
  const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT!
  const apiBaseUrl =
    ENVIRONMENT === 'prod'
      ? import.meta.env.VITE_PROD_SERVER_URL
      : import.meta.env.VITE_DEV_SERVER_URL

  return new Promise((resolve, reject) => {
    const formData = new FormData()

    formData.append('file', entry.file)
    formData.append('modelId', props.modelId)
    formData.append('imageId', entry.id)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      {
        if (e.lengthComputable) {
          const index = fileList.value.findIndex((f) => f.id === entry.id)
          if (index !== -1) {
            fileList.value[index].progress = Math.round(
              (e.loaded / e.total) * 80,
            )
          }
        }
      }
    }

    xhr.onload = () => {
      const index = fileList.value.findIndex((f) => f.id === entry.id)
      if (xhr.status === 200) {
        if (index !== -1) {
          fileList.value[index].progress = 100
        }
        resolve()
      } else {
        if (index !== -1) {
          fileList.value[index].error = true
        }
        reject(new Error(xhr.responseText))
      }
    }

    xhr.onerror = () => {
      const index = fileList.value.findIndex((f) => f.id === entry.id)
      if (index !== -1) {
        fileList.value[index].error = true
      }
      reject(new Error('Network error'))
    }

    xhr.open('POST', `${apiBaseUrl}/images/process`)
    xhr.withCredentials = true
    xhr.send(formData)
  })
}

const processFiles = async (files: File[]) => {
  const entries: ProcessedFile[] = files.map((f) => ({
    id: uuid(),
    file: f,
    progress: 0,
    error: false,
  }))

  fileList.value = [...fileList.value, ...entries]

  const CONCURRENCY = 3
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    await Promise.allSettled(entries.slice(i, i + CONCURRENCY).map(uploadFile))
  }
}

const allReady = computed(
  () =>
    fileList.value.length > 0 &&
    fileList.value.every((f) => f.progress === 100 || f.error),
)

const handleConfirm = async () => {
  const images = fileList.value
    .filter((f) => f.progress === 100)
    .map((f, index) => ({ id: f.id, order: index, alt: f.alt }))

  await axiosInstance.post('/images', { modelId: props.modelId, images })

  emit('done')
}

const handleCancel = async () => {
  const uploadedIds = fileList.value
    .filter((f) => f.progress === 100)
    .map((f) => f.id)

  if (uploadedIds.length > 0) {
    await axiosInstance.delete('/images/process', {
      data: { modelId: props.modelId, imageIds: uploadedIds },
    })
  }

  fileList.value = []
  emit('cancel')
}
</script>
