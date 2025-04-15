<template>
  <Teleport to="body">
    <div class="fixed top-10 start-1/2 -translate-x-1/2 z-50">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <Toast
          v-for="(toast, index) in toasts"
          :type="toast.type"
          :message="toast.message"
          :key="`toast-${index}`"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Toast from "./Toast.vue";
import { useToastStore } from "../stores/toastStore";
import { storeToRefs } from "pinia";

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
