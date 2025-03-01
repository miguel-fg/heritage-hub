<template>
  <div
    class="relative z-50"
    aria-modal="true"
    role="dialog"
    aria-labelledby="modal-title"
  >
    <div
      class="flex w-full justify-center items-center fixed inset-0 bg-grayscale-900/80"
    >
      <div
        class="flex flex-col relative justify-center items-center px-6 py-3 max-w-9/10 md:max-w-md rounded-sm gap-5 bg-grayscale-100"
      >
        <button
          @click="emit('close')"
          class="absolute right-2 top-2 cursor-pointer"
        >
          <img
            src="../../assets/icons/close_dark.svg"
            alt="Close button"
            class="w-[20px] h-[20px]"
          />
        </button>
        <slot name="title" />
        <slot name="warning" />
        <slot name="buttons" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["close"]);
</script>
