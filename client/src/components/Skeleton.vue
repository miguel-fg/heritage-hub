<template>
  <div class="flex w-full flex-col animate-pulse">
    <div v-if="props.for === 'card'">
      <div class="h-3 bg-grayscale-200/50 w-3/4 mb-2"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-7/8 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-2"></div>
      <div class="flex gap-2">
        <div class="h-2 bg-grayscale-200/50 w-[30px]"></div>
        <div class="h-2 bg-grayscale-200/50 w-[30px]"></div>
        <div class="h-2 bg-grayscale-200/50 w-[30px]"></div>
      </div>
    </div>
    <div v-else-if="props.for === 'model-description'">
      <div class="h-4 bg-grayscale-200/50 w-3/4 mb-2"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-7/8 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-4/5 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-1/2 mb-4"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-5/7 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-3/4 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-4/5 mb-2"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-7/8 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-2"></div>
      <div class="h-3 bg-grayscale-200/50 w-1/3 mb-3"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-4/5 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-1/2 mb-4"></div>
      <div class="h-3 bg-grayscale-200/50 w-1/3 mb-3"></div>
      <div class="h-2 bg-grayscale-200/50 w-full mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-3/4 mb-1"></div>
      <div class="h-2 bg-grayscale-200/50 w-4/5 mb-2"></div>
      <div class="flex gap-2">
        <div class="h-2 bg-grayscale-200/50 w-[30px]"></div>
        <div class="h-2 bg-grayscale-200/50 w-[30px]"></div>
        <div class="h-2 bg-grayscale-200/50 w-[30px]"></div>
      </div>
    </div>
    <div
      v-else-if="props.for === 'thumbnail'"
      class="flex items-center justify-center w-full h-32 bg-grayscale-200/50 rounded-sm"
    >
      <svg
        class="w-10 h-10 fill-grayscale-200 text-grayscale-100"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 18"
      >
        <path
          d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"
        />
      </svg>
    </div>
    <div
      v-else-if="props.for === 'model'"
      class="flex items-center justify-center w-full h-120 bg-grayscale-200/50 rounded-sm"
    >
      <svg
        class="w-10 h-10 fill-grayscale-200 text-grayscale-100"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 18"
      >
        <path
          d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"
        />
      </svg>
    </div>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  for: String,
});
</script>
