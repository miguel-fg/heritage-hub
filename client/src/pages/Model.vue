<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <ModelPageToolbar
        :has-permissions="hasPermissions"
        :modelLoaded="!loading && isDefined(model)"
        @back="() => router.back()"
        @edit="
          () => {
            if (model) handleEdit(model)
          }
        "
        @attach=""
        @delete="() => (showConfirmModal = true)"
      />
      <div v-if="loading" class="flex flex-col gap-4 lg:flex-row">
        <div class="flex w-full lg:w-3/5">
          <Skeleton for="model" />
        </div>
        <div class="flex w-full lg:w-2/5">
          <Skeleton for="model-description" />
        </div>
      </div>
      <div
        v-else-if="!loading && model"
        class="flex flex-col gap-4 lg:flex-row mt-5"
      >
        <div
          class="flex h-120 lg:h-200 lg:w-5/9 max-h-[650px] rounded-sm justify-center items-center"
        >
          <Visualizer :modelId="model.id" :downloadable="model.downloadable" />
        </div>
        <div class="flex flex-col gap-4 lg:w-4/9">
          <div>
            <h1 class="title text-primary-500 mb-2">{{ model.name }}</h1>
            <div class="flex items-center gap-1 mb-3">
              <span class="tag text-grayscale-500">
                {{ model.owner.displayName }}
              </span>
              <span
                v-if="model.owner.displayName"
                class="tag text-grayscale-500"
              >
                &#128900;
              </span>
              <span class="tag text-grayscale-500">
                {{ cleanDate(model.createdAt) }}
              </span>
            </div>
            <div class="flex gap-1 flex-wrap">
              <Tag v-for="tag in model.tags" :content="tag.name" />
            </div>
          </div>
          <div>
            <div class="flex flex-col gap-4">
              <p class="body text-grayscale-900 whitespace-pre-line">
                {{ truncatedDescription() }}
              </p>
            </div>
            <Button
              type="ghost"
              v-if="showReadMore"
              @click="() => (isTruncated = !isTruncated)"
              class="tag underline-none mt-2"
              >{{ isTruncated ? 'Read more' : 'Read less' }}
              <Icon v-show="isTruncated" icon="bx:chevron-down" width="20" />
              <Icon v-show="!isTruncated" icon="bx:chevron-up" width="20" />
            </Button>
          </div>
          <div
            v-if="
              model.provenance ||
              model.dimensions.length > 0 ||
              model.materials.length > 0
            "
            class="pt-4 border-t-1 border-grayscale-300 flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between"
          >
            <div v-if="model.dimensions.length > 0">
              <h2 class="subtitle text-primary-500">Dimensions</h2>
              <ul class="body text-grayscale-900">
                <li v-for="dim in model.dimensions">
                  {{ formatDimension(dim) }}
                </li>
              </ul>
            </div>
            <div
              v-if="model.materials.length > 0"
              class="pt-4 border-t-1 border-grayscale-300 md:pt-0 md:border-t-0"
            >
              <h2 class="subtitle text-primary-500">Materials</h2>
              <ul class="body text-grayscale-900">
                <li v-for="material in model.materials">
                  {{ material.name }}
                </li>
              </ul>
            </div>
            <div
              v-if="model.provenance"
              class="pt-4 border-t-1 border-grayscale-300 md:pt-0 md:border-t-0"
            >
              <h2 class="subtitle text-primary-500">Provenance</h2>
              <p class="body text-grayscale-900 whitespace-pre-line">
                {{ model.provenance }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="!loading && error"
        class="flex flex-col text-grayscale-500"
      >
        <h1 class="title text-5xl text-wrap mb-8">
          Error fetching model information.
        </h1>
        <h1 class="title text-7xl mb-16">:(</h1>
        <h2 class="title text-3xl text-grayscale-300">
          Model ID: {{ route.params.id }}
        </h2>
        <span class="font-poppins text-xl">{{ error }}</span>
      </div>
    </div>
    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
  <ConfirmationModal
    :visible="showConfirmModal"
    @confirm="
      () => {
        showConfirmModal = false
        deleteModel()
      }
    "
    @cancel="() => (showConfirmModal = false)"
  >
    <template #title>Confirm deletion</template>
    <template #subtitle>Are you sure you want to delete this model?</template>
    <template #warning
      >Deleting this model will
      <span class="font-medium">permanently delete</span> all information,
      hotspots and comments associated with it.</template
    >
    <template #confirm>Delete</template>
    <template #cancel>Cancel</template>
  </ConfirmationModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axiosInstance from '../scripts/axiosConfig'
import Button from '../components/Button.vue'
import Tag from '../components/Tag.vue'
import Skeleton from '../components/Skeleton.vue'
import Visualizer from '../components/three/Visualizer.vue'
import { useDimensions } from '../scripts/useDimensions'
import Footer from '../components/Footer.vue'
import { useUserStore } from '../stores/userStore'
import { useModelStore } from '../stores/modelStore'
import { useHotspotStore } from '../stores/hotspotStore'
import { useToastStore } from '../stores/toastStore'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import ModelPageToolbar from '../components/ModelPageToolbar.vue'
import { Icon } from '@iconify/vue'
import { type Model } from '../types/model'
import { useEdit } from '../scripts/useEdit'
import { isDefined } from '@vueuse/core'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const model = ref<Model | null>(null)
const error = ref<any>(null)

const isTruncated = ref(true)
const { formatDimension } = useDimensions()

const { initEditState } = useEdit()

const userStore = useUserStore()
const modelStore = useModelStore()
const hotspotStore = useHotspotStore()
const toastStore = useToastStore()

const showConfirmModal = ref(false)

const cleanDate = (rawDate: string): string => {
  const date = new Date(rawDate)

  return date.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const truncatedDescription = (): string => {
  let description = model.value?.description || ''
  const maxLength = 350

  if (isTruncated.value && description.length > maxLength) {
    description = description.slice(0, maxLength) + '...'
  }

  return description
}

const fetchModelData = async (): Promise<void> => {
  error.value = model.value = null
  loading.value = true

  const modelId = paramGuard(route.params.id)

  if (!modelId) {
    toastStore.showToast('error', 'Invalid model ID')
    router.replace('/')
    return
  }

  try {
    const response = await axiosInstance.get(`models/${modelId}`)
    model.value = response.data.model

    if (model.value) {
      hotspotStore.setHotspotState(model.value.hotspots)
    }
  } catch (err: any) {
    console.error('Failed to fetch data from model. ERR: ', err)
    toastStore.showToast('error', 'Failed to fetch model data.')
    model.value = null
    error.value = err
  } finally {
    loading.value = false
  }
}

const deleteModel = async (): Promise<void> => {
  error.value = model.value = null
  loading.value = true

  const modelId = paramGuard(route.params.id)

  if (!modelId) {
    toastStore.showToast('error', 'Invalid model ID')
    router.replace('/')
    return
  }

  try {
    await axiosInstance.delete(`models/${modelId}`)
    modelStore.removeModelById(modelId)

    toastStore.showToast('success', 'Model deleted successfully!')
    router.push('/')
  } catch (err: any) {
    console.error('Failed to delete model. ERR: ', err)
    toastStore.showToast('error', 'Failed to delete model.')
  } finally {
    loading.value = false
  }
}

const paramGuard = (param: string | string[] | undefined): string | null => {
  if (typeof param === 'string') return param
  return null
}

const showReadMore = computed(() => {
  const description = model.value?.description

  return description && description.length > 350
})

const hasPermissions = computed(() => {
  const user = userStore.user

  const isOwner =
    user &&
    user.id === model.value?.ownerId &&
    user.permissions !== 'RESTRICTED'
  const isElevatedUser =
    user && (user.permissions === 'FULL' || user.permissions === 'ADMIN')

  return isOwner || isElevatedUser || false
})

const handleEdit = async (model: Model) => {
  const initialized = await initEditState(model)

  if (initialized) {
    router.push({ name: 'Edit', params: { id: model.id } })
  } else {
    console.error('Failed to initialize edit state')
  }
}

onMounted(() => {
  fetchModelData()
})

onUnmounted(() => {
  model.value = null
  loading.value = false
  error.value = null
  hotspotStore.cleanHotspotState()
})
</script>
