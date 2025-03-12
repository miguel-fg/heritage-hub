<template>
  <button
    @click="toggleExpand"
    class="cursor-pointer hover:bg-grayscale-200 w-[20px] h-[20px]"
  >
    <svg
      v-if="menuOpen"
      width="12"
      height="2"
      viewBox="0 0 12 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="mx-auto"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0 0H12V2H0V0Z"
        fill="#272626"
      />
    </svg>

    <svg
      v-else
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="mx-auto"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.99995 5.54385L11.0254 0.5L12 1.47809L5.99995 7.5L0 1.47809L0.974521 0.5L5.99995 5.54385Z"
        fill="#272626"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
const menuOpen = defineModel({ default: true });

const toggleExpand = () => {
  menuOpen.value = !menuOpen.value;
};
</script>
