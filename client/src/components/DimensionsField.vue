<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 w-full gap-y-3 gap-x-6"
  >
    <DimensionInput dimension="width" />
    <DimensionInput dimension="height" />
    <DimensionInput dimension="depth" />
    <DimensionInput dimension="weight" />
    <DimensionInput dimension="volume" />
  </div>
</template>

<script setup lang="ts">
import DimensionInput from "./DimensionInput.vue";
</script>
