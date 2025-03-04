<template>
  <InputField fieldId="name" label="Name" />
  <InputField fieldId="caption" label="Caption" />
  <TextArea fieldId="description" label="Description" />
</template>

<script setup lang="ts">
import InputField from "./InputField.vue";
import TextArea from "./TextArea.vue";
</script>
