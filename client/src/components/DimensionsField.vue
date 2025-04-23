<template>
  <div class="flex flex-col w-full sm:max-w-56 gap-3">
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
