<template>
  <div>
    <input
      v-model="selected"
      type="radio"
      id="white"
      name="bg-color"
      value="white"
    />
    <label for="white">white</label>
    <input
      v-model="selected"
      type="radio"
      id="gray"
      name="bg-color"
      value="gray"
    />
    <label for="gray">gray</label>
    <input
      v-model="selected"
      type="radio"
      id="black"
      name="bg-color"
      value="black"
    />
    <label for="black">black</label>
  </div>
</template>

<script setup lang="ts">
const selected = defineModel();
</script>
