<template>
  <div class="flex w-full justify-between items-center relative">
    <Button type="ghost" @click="emit('back')">
      <Icon icon="bx:arrow-back" width="20" height="20" />
      Back
    </Button>
    <Button
      v-if="props.hasPermissions && props.modelLoaded"
      @click="toggleOptionsOpen"
      type="ghost"
      class="sm:hidden"
    >
      Options
      <Icon
        v-if="!isOptionsOpen"
        icon="bx:chevron-down"
        width="20"
        height="20"
      />
      <Icon v-if="isOptionsOpen" icon="bx:chevron-up" width="20" height="20" />
    </Button>
    <div
      v-if="props.hasPermissions && props.modelLoaded"
      class="hidden sm:flex gap-8 items-center"
    >
      <Button type="ghost" @click="emit('edit')">
        <Icon icon="bx:edit" width="20" height="20" />
        Edit
      </Button>
      <Button type="ghost" @click="emit('attach')">
        <Icon icon="bx:paperclip" width="20" height="20" />
        Attach
      </Button>
      <Button type="ghost" @click="emit('delete')">
        <Icon icon="bx:trash" width="20" height="20" />
        Delete
      </Button>
    </div>
    <div
      v-if="isOptionsOpen"
      class="absolute right-1 top-full z-50 flex flex-col bg-white shadow-sm rounded-sm mt-1"
    >
      <Button type="ghost" @click="emit('edit')" class="px-6 py-3">
        <Icon icon="bx:edit" width="20" height="20" />
        Edit
      </Button>
      <Button type="ghost" @click="emit('attach')" class="px-6 py-3">
        <Icon icon="bx:paperclip" width="20" height="20" />
        Attach
      </Button>
      <Button type="ghost" @click="emit('delete')" class="px-6 py-3">
        <Icon icon="bx:trash" width="20" height="20" />
        Delete
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const emit = defineEmits(['back', 'edit', 'attach', 'delete'])
const props = defineProps<{
  hasPermissions: boolean
  modelLoaded: boolean
}>()

const isOptionsOpen = ref(false)

const toggleOptionsOpen = () => (isOptionsOpen.value = !isOptionsOpen.value)
</script>
