import { defineStore } from "pinia";
import { ref } from "vue";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

let idCounter = 0;

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  const showToast = (type: Toast["type"], message: string, duration = 3000) => {
    const id = idCounter++;
    toasts.value.push({ id, type, message });

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  };

  return { toasts, showToast };
});
