import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
  duration: number
}

let idCounter = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const showToast = (type: Toast['type'], message: string, duration = 5000) => {
    const id = idCounter++
    toasts.value.push({ id, type, message, duration })
  }

  const dismissToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, dismissToast }
})
