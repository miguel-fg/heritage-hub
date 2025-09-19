<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <div class="flex flex-col gap-4">
        <h1 class="title text-5xl text-wrap text-grayscale-500">
          Page under construction.
        </h1>
        <Icon icon="bx:wrench" height="60" class="text-grayscale-300" />
      </div>
    </div>

    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Footer from "../components/Footer.vue";
import { Icon } from "@iconify/vue";
</script>
