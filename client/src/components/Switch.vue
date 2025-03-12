<template>
  <label :for="props.label" class="flex items-center">
    <input :id="props.label" type="checkbox" v-model="checked" />
    <span></span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps({
  label: { type: String, required: true },
});

const checked = defineModel<boolean>();
</script>
