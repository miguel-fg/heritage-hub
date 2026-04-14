<template>
  <Teleport to="body">
    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2 items-center md:items-end"
      >
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :id="toast.id"
          :type="toast.type"
          :message="toast.message"
          :duration="toast.duration"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Toast from './Toast.vue'
import { useToastStore } from '../stores/toastStore'
import { storeToRefs } from 'pinia'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
