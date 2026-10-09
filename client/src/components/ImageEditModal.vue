<template>
  <Teleport to="body">
    <div
      v-if="props.visible && props.toEdit"
      class="fixed flex justify-center items-center inset-0 z-200 bg-grayscale-900/70 px-4"
    >
      <div
        class="bg-grayscale-100 rounded-sm flex flex-col w-full max-w-[500px] px-8 py-4 font-poppins"
        role="dialog"
        aria-modal="true"
      >
        <h1 class="text-primary-500 texl-xl mb-1 font-bold">
          {{
            showDeleteConfirmation
              ? 'Are you sure you want to delete this image?'
              : 'Edit Image'
          }}
        </h1>
        <div class="w-full h-[300px] bg-white shadow-md">
          <img
            :src="props.toEdit.fullUrl"
            :alt="props.toEdit.alt ?? 'image preview'"
            class="w-full h-full object-contain"
          />
        </div>
        <div v-show="!showDeleteConfirmation" class="flex flex-col my-10 gap-5">
          <div>
            <label for="media-label" class="font-bold text-grayscale-700"
              >Label</label
            >
            <input
              v-model="props.toEdit.label"
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
              v-model="props.toEdit.description"
              name="media-description"
              id="media-description"
              rows="3"
              class="w-full px-2 py-1 bg-white rounded-xs body border border-grayscale-300 resize-none"
            />
          </div>
        </div>
        <div v-show="showDeleteConfirmation" class="flex flex-col mt-2 mb-10">
          <strong class="font-bold text-primary-500">{{
            props.toEdit.label ?? 'No label'
          }}</strong>
          <div class="grow-1 min-w-0">
            <p class="body truncate">
              {{ props.toEdit.description ?? 'No description' }}
            </p>
          </div>
          <div
            class="mt-5 flex gap-5 border-1 border-warning-600 rounded-xs bg-warning-100 items-center text-sm text-warning-800 py-2 px-4"
          >
            <Icon icon="bx:error" width="50" class="text-warning-600" />
            <div class="w-full flex flex-col gap-1">
              <strong>Warning</strong>
              <p class="text-pretty">
                This action will
                <span class="font-medium">permanently</span> delete the image,
                its label, and its description.
              </p>
            </div>
          </div>
        </div>
        <div v-show="!showDeleteConfirmation" class="flex gap-5 w-full">
          <Button
            @click="emit('cancel-edit')"
            type="secondary"
            class="grow-1 justify-center"
            >Cancel</Button
          >
          <Button
            @click="() => (showDeleteConfirmation = true)"
            type="danger"
            class="grow-1 justify-center"
            >Delete Image</Button
          >
          <Button
            @click="emit('save-edit')"
            type="success"
            class="grow-1 justify-center"
            >Save Changes</Button
          >
        </div>
        <div v-show="showDeleteConfirmation" class="flex gap-5 w-full">
          <Button
            @click="() => (showDeleteConfirmation = false)"
            type="secondary"
            class="grow-1 justify-center"
          >
            Cancel Delete
          </Button>
          <Button
            @click="
              () => {
                showDeleteConfirmation = false
                emit('delete-image')
              }
            "
            type="danger"
            class="grow-1 justify-center"
            >Delete Image</Button
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from './Button.vue'
import { type Model } from '../types/model'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  visible: boolean
  toEdit: Model['images'][number] | null
}>()

const emit = defineEmits(['cancel-edit', 'delete-image', 'save-edit'])

const showDeleteConfirmation = ref(false)

watch(
  () => props.visible,
  () => (showDeleteConfirmation.value = false),
)
</script>
