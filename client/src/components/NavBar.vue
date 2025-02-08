<template>
  <div class="flex flex-col border-b border-grayscale-300">
    <div
      class="flex lg:justify-between items-center px-4 md:px-8 lg:px-16 py-2 bg-white gap-5"
    >
      <div class="flex gap-4 lg:gap-12 grow-1 items-center">
        <img class="w-10" src="/HH_red.svg" alt="Heritage Hub logo" />
        <Button class="lg:hidden" type="search" @clicked="handleSearch">
          <img
            src="../../assets/icons/search.svg"
            alt="Search icon"
            class="w-4"
          />
          <span>Search</span>
        </Button>
        <nav class="hidden lg:block">
          <ul class="flex gap-8 bg-white font-poppins font-regular">
            <li class="hover:underline">Home</li>
            <li class="hover:underline">Explore</li>
            <li class="hover:underline">About</li>
          </ul>
        </nav>
      </div>
      <div class="flex gap-4 lg:gap-12">
        <Button
          class="hidden lg:inline-flex w-xs"
          type="search"
          @clicked="handleSearch"
        >
          <img
            src="../../assets/icons/search.svg"
            alt="Search icon"
            class="w-4"
          />
          <span>Search</span>
        </Button>
        <Button type="primary" class="px-3" @clicked="handleUpload">
          <img
            src="../../assets/icons/upload.svg"
            alt="Upload icon"
            class="w-4"
          />
          <span class="hidden md:block">Upload</span>
        </Button>
        <Button type="ghost" @clicked="toggleNav" class="lg:hidden">
          <img
            v-if="!isOpen"
            src="../../assets/icons/menu.svg"
            alt="Menu icon"
          />
          <img
            v-else
            src="../../assets/icons/close.svg"
            alt="Close icon"
            class="pl-1"
          />
        </Button>
      </div>
    </div>
    <nav class="lg:hidden" v-show="isOpen">
      <ul class="flex flex-col gap-2 pt-2 bg-white font-poppins font-regular">
        <li class="pl-4 py-2 hover:bg-primary-100/50">Home</li>
        <li class="pl-4 py-2 hover:bg-primary-100/50">Explore</li>
        <li class="pl-4 py-2 hover:bg-primary-100/50">About</li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "./Button.vue";

const isOpen = ref(false);

const toggleNav = () => {
  isOpen.value = !isOpen.value;
};

const handleSearch = () => {
  console.log("Search pressed!");
};

const handleUpload = () => {
  console.log("Upload pressed!");
};
</script>
