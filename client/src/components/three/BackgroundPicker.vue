<template>
  <div class="flex gap-2 justify-between">
    <label
      for="white"
      class="flex items-center justify-center rounded-sm border-2 cursor-pointer w-11 h-8"
      :class="
        selected === 'white'
          ? 'border-primary-400'
          : 'border-grayscale-400 hover:border-grayscale-600'
      "
    >
      <input
        v-model="selected"
        type="radio"
        id="white"
        name="bg-color"
        value="white"
        class="hidden"
      />
      <div class="w-9 h-6 bg-white rounded-xs"></div>
    </label>

    <label
      for="gray"
      class="flex items-center justify-center rounded-sm border-2 cursor-pointer w-11 h-8"
      :class="
        selected === 'gray'
          ? 'border-primary-400'
          : 'border-grayscale-400 hover:border-grayscale-600'
      "
    >
      <input
        v-model="selected"
        type="radio"
        id="gray"
        name="bg-color"
        value="gray"
        class="hidden"
      />
      <div class="w-9 h-6 bg-[#888888] rounded-xs"></div>
    </label>

    <label
      for="black"
      class="flex items-center justify-center rounded-sm border-2 cursor-pointer w-11 h-8"
      :class="
        selected === 'black'
          ? 'border-primary-400'
          : 'border-grayscale-400 hover:border-grayscale-600'
      "
    >
      <input
        v-model="selected"
        type="radio"
        id="black"
        name="bg-color"
        value="black"
        class="hidden"
      />
      <div class="w-9 h-6 bg-black rounded-xs"></div>
    </label>
  </div>
</template>

<script setup lang="ts">
const selected = defineModel();
</script>
