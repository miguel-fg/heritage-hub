<template>
  <div class="w-full">
    <input
      type="range"
      :min="props.min"
      :max="props.max"
      v-model="current"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  min: { type: String, default: "0" },
  max: { type: String, default: "100" },
});

const current = defineModel<string>();
</script>
