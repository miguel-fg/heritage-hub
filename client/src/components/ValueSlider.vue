<template>
  <div class="flex flex-col gap-3">
    <span>{{ props.label }}</span>
    <div class="w-full relative mb-2">
      <div class="absolute inset-0 h-1 bg-grayscale-300 rounded-xs"></div>
      <div
        class="absolute h-1 bg-primary-400 rounded-xs"
        :style="{
          width: `${((Number(current) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100}%`,
        }"
      ></div>
      <input
        type="range"
        :min="props.min"
        :max="props.max"
        v-model="current"
        class="w-full appearance-none bg-transparent absolute inset-0 z-10 cursor-pointer"
      />
      <div
        class="absolute w-2 h-5 bg-primary-100 shadow-xs rounded-xs transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        :style="{
          left: `${((Number(current) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100}%`,
          top: '50%',
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  min: { type: String, default: "0" },
  max: { type: String, default: "100" },
  label: { type: String, required: true },
});

const current = defineModel<string>();
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

input[type="range"]::-ms-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
