<template>
  <div class="flex flex-col gap-1 w-full">
    <span class="subtitle text-primary-500">Dimensions</span>
    <div class="flex flex-col max-w-72 gap-2">
      <DimensionInput dimension="width" />
      <DimensionInput dimension="height" />
      <DimensionInput dimension="depth" />
      <DimensionInput dimension="weight" />
      <DimensionInput dimension="volume" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DimensionInput from "./DimensionInput.vue";
</script>
