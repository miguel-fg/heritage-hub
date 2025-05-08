<template>
  <div class="flex flex-col w-full gap-1">
    <h1 class="subtitle text-grayscale-700">Dimensions</h1>
    <div class="flex flex-col w-full gap-3">
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
