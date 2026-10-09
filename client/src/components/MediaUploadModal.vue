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
        <div v-show="stage === 'upload'" class="flex gap-5 w-full pt-2 mb-5">
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
            class="flex flex-col items-center w-full gap-1 pb-2"
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
              disabled
            />
          </label>
        </div>
        <div v-show="stage === 'upload'" class="mb-5">
          <MediaDropzone @files="processFiles" />
          <p class="text-xs md:text-sm mt-2 text-grayscale-600">
            Supported Formats: JPG, PNG, WEBP, PDF
          </p>
        </div>
        <div
          v-show="fileList.length && stage === 'upload'"
          class="flex flex-col max-h-62 overflow-y-auto overflow-x-hidden mb-5 gap-3"
        >
          <MediaListItem
            v-for="entry in fileList"
            :file="entry.file"
            :progress="entry.progress"
            :error="entry.error"
          />
        </div>
        <div v-show="stage === 'upload'" class="flex gap-5 w-full">
          <Button
            @click="handleCancel"
            type="secondary"
            class="grow-1 justify-center"
            >Cancel</Button
          >
          <Button
            @click="handleContinue"
            type="success"
            :disabled="!allReady || !hasSuccesses"
            class="grow-1 justify-center"
            >Continue</Button
          >
        </div>
        <MediaAnnotation
          v-if="currentAnnotation && stage === 'annotate'"
          :current="currentAnnotation"
          :progress="annotateProgress"
          @continue="handleContinue"
          @back="handleBack"
          @cancel="handleCancel"
        />
        <MediaConfirmation
          v-if="fileList.length && stage === 'list'"
          :files="fileList"
          @confirm="handleConfirm"
          @back="handleBack"
          @cancel="handleCancel"
        />
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
import MediaAnnotation from './MediaAnnotation.vue'
import MediaConfirmation from './MediaConfirmation.vue'
import { v4 as uuid } from 'uuid'
import axiosInstance from '../scripts/axiosConfig'
import { useToastStore } from '../stores/toastStore'
import { type ModelImage, type ModelPdf } from '../types/model'
import { type Stage, type ProcessedFile } from '../types/media'

const props = defineProps<{
  visible?: boolean
  modelId: string
  imageCount: number
}>()

const emit = defineEmits<{
  cancel: []
  done: [images: ModelImage[], pdfs: ModelPdf[]]
}>()

const uploadType = ref<'attach' | 'embed'>('attach')

const stage = ref<Stage>('upload')
const annotateIndex = ref(0)

const fileList = ref<ProcessedFile[]>([])

const toastStore = useToastStore()

const inFlight = new Set<XMLHttpRequest>()

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

    if (entry.type === 'image') {
      formData.append('imageId', entry.id)
    } else {
      formData.append('pdfId', entry.id)
    }

    const xhr = new XMLHttpRequest()
    inFlight.add(xhr)
    xhr.addEventListener('loadend', () => inFlight.delete(xhr))

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

    xhr.onabort = () => reject(new Error('Aborted'))

    const endpoint = entry.type === 'image' ? 'images' : 'pdfs'

    xhr.open('POST', `${apiBaseUrl}/${endpoint}/process`)
    xhr.withCredentials = true
    xhr.send(formData)
  })
}

const processFiles = async (files: File[]) => {
  const entries: ProcessedFile[] = files.map((f) => ({
    id: uuid(),
    file: f,
    previewUrl: f.type.includes('pdf') ? undefined : URL.createObjectURL(f),
    type: f.type.includes('pdf') ? 'pdf' : 'image',
    progress: 0,
    error: false,
  }))

  fileList.value = [...fileList.value, ...entries]

  const CONCURRENCY = 3
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    await Promise.allSettled(entries.slice(i, i + CONCURRENCY).map(uploadFile))
  }
}

const successfulImages = computed(() =>
  fileList.value.filter((f) => f.type === 'image' && f.progress === 100),
)
const hasSuccesses = computed(() =>
  fileList.value.some((f) => f.progress === 100),
)
const currentAnnotation = computed(
  () => successfulImages.value[annotateIndex.value],
)
const annotateProgress = computed(
  () => `${annotateIndex.value + 1} / ${successfulImages.value.length}`,
)

const allReady = computed(
  () =>
    fileList.value.length > 0 &&
    fileList.value.every((f) => f.progress === 100 || f.error),
)

const handleContinue = () => {
  if (
    stage.value === 'annotate' &&
    annotateIndex.value + 1 < successfulImages.value.length
  ) {
    annotateIndex.value++
  } else {
    handleNextStage()
  }
}

const handleBack = () => {
  if (stage.value === 'upload') return

  if (stage.value === 'list') {
    if (successfulImages.value.length) stage.value = 'annotate'
    else stage.value = 'upload'
  } else {
    if (annotateIndex.value > 0) annotateIndex.value--
    else stage.value = 'upload'
  }
}

const handleNextStage = () => {
  switch (stage.value) {
    case 'upload':
      if (successfulImages.value.length) {
        stage.value = 'annotate'
        annotateIndex.value = 0
      } else {
        stage.value = 'list'
      }
      return
    case 'annotate':
      return (stage.value = 'list')
    case 'list':
      return (stage.value = 'upload')
  }
}

const handleConfirm = async () => {
  const successful = fileList.value.filter((f) => f.progress === 100)

  const imagesToCreate = successful
    .filter((f) => f.type === 'image')
    .map((f, index) => ({
      id: f.id,
      order: props.imageCount + index,
      alt: f.label || `Supporting image number ${props.imageCount + index}.`,
      label: f.label,
      description: f.description,
    }))

  const pdfsToCreate = successful
    .filter((f) => f.type === 'pdf')
    .map((f) => ({ id: f.id, title: f.file.name }))

  try {
    const uploadPromises: Promise<any>[] = []

    if (imagesToCreate.length > 0) {
      uploadPromises.push(
        axiosInstance.post('/images', {
          modelId: props.modelId,
          images: imagesToCreate,
        }),
      )
    } else {
      uploadPromises.push(Promise.resolve({ data: { images: [] } }))
    }

    if (pdfsToCreate.length > 0) {
      uploadPromises.push(
        axiosInstance.post('/pdfs', {
          modelId: props.modelId,
          pdfs: pdfsToCreate,
        }),
      )
    } else {
      uploadPromises.push(Promise.resolve({ data: { pdfs: [] } }))
    }

    const [imageResponse, pdfResponse] = await Promise.all(uploadPromises)

    const finalImages = imageResponse.data.images
    const finalPdfs = pdfResponse.data.pdfs

    releasePreviews()
    fileList.value = []
    stage.value = 'upload'
    annotateIndex.value = 0
    emit('done', finalImages, finalPdfs)
  } catch (error) {
    console.error('Failed to confirm media upload: ', error)
    toastStore.showToast('error', 'Failed to save media records.')
  }
}

const handleCancel = async () => {
  const imageIds = fileList.value
    .filter((f) => f.type === 'image')
    .map((f) => f.id)
  const pdfIds = fileList.value.filter((f) => f.type === 'pdf').map((f) => f.id)

  inFlight.forEach((xhr) => xhr.abort())
  inFlight.clear()

  await Promise.all([
    ...(imageIds.length > 0
      ? [
          axiosInstance.delete('/images/process', {
            data: { modelId: props.modelId, imageIds },
          }),
        ]
      : []),
    ...(pdfIds.length > 0
      ? [
          axiosInstance.delete('/pdfs/process', {
            data: { modelId: props.modelId, pdfIds },
          }),
        ]
      : []),
  ])

  releasePreviews()
  fileList.value = []
  stage.value = 'upload'
  annotateIndex.value = 0
  emit('cancel')
}

const releasePreviews = () => {
  fileList.value
    .filter((f) => f.previewUrl)
    .forEach((f) => {
      URL.revokeObjectURL(f.previewUrl!)
    })
}
</script>
