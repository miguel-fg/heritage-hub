<template>
  <Teleport to="body">
    <div
      v-if="props.visible"
      class="fixed flex justify-center items-center inset-0 z-200 bg-grayscale-900/70 px-4"
    >
      <div
        class="flex flex-col justify-center items-center bg-grayscale-100 px-6 py-3 gap-5 shadow-lg w-full max-w-md rounded-sm"
        role="dialog"
        aria-modal="true"
      >
        <h1 class="title text-grayscale-900">
          <slot name="title">Are you sure?</slot>
        </h1>
        <h2 class="font-poppins text-grayscale-700">
          <slot name="subtitle">This action cannot be undone.</slot>
        </h2>
        <div
          v-if="$slots.warning"
          class="flex flex-col px-3 py-2 bg-warning-100 shadow-sm rounded-xs gap-2"
        >
          <div class="flex gap-1 items-center">
            <span class="tag text-warning-800">Warning</span>
          </div>
          <p class="font-poppins text-xs text-warning-900">
            <slot name="warning" />
          </p>
        </div>
        <div class="flex gap-5">
          <Button @click="emit('cancel')" type="secondary"
            ><slot name="cancel">Cancel</slot></Button
          >
          <Button @click="emit('confirm')" type="danger"
            ><slot name="confirm">Confirm</slot></Button
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Button from "./Button.vue";

const props = defineProps({
  visible: { type: Boolean },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>
