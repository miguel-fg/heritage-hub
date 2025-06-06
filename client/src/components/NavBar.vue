<template>
  <div class="w-full">
    <div
      class="w-full bg-white px-4 md:px-8 lg:px-16"
      :class="isOpen ? 'border-none' : 'border-b border-grayscale-300'"
    >
      <div class="w-full mx-auto max-w-[1920px]">
        <div class="flex flex-col">
          <div class="flex lg:justify-between items-center py-2 gap-5">
            <div class="flex gap-4 lg:gap-12 grow-1 items-center">
              <img class="w-10" src="/HH_red.svg" alt="Heritage Hub logo" />
              <Button class="lg:hidden" type="search" @click="handleSearch">
                <img
                  src="../../assets/icons/search.svg"
                  alt="Search icon"
                  class="w-4"
                />
                <span>Search</span>
              </Button>
              <nav class="hidden lg:block">
                <ul class="flex gap-8 bg-white font-poppins font-regular">
                  <li
                    class="pointer-cursor"
                    :class="
                      route.name === 'Home'
                        ? 'border-b-3 border-primary-500 text-primary-600 font-medium'
                        : 'border-none hover:underline'
                    "
                  >
                    <RouterLink to="/home">Home</RouterLink>
                  </li>
                  <li
                    class="pointer-cursor"
                    :class="
                      route.name === 'About'
                        ? 'border-b-3 border-primary-500 text-primary-600 font-medium'
                        : 'border-none hover:underline'
                    "
                  >
                    <RouterLink to="/about">About</RouterLink>
                  </li>
                  <li
                    class="pointer-cursor"
                    :class="
                      route.name === 'Gallery'
                        ? 'border-b-3 border-primary-500 text-primary-600 font-medium'
                        : 'border-none hover:underline'
                    "
                  >
                    <RouterLink to="/">Explore</RouterLink>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="flex gap-4 lg:gap-12">
              <Button
                class="hidden lg:inline-flex w-xs"
                type="search"
                @click="handleSearch"
              >
                <img
                  src="../../assets/icons/search.svg"
                  alt="Search icon"
                  class="w-4"
                />
                <span>Search</span>
              </Button>
              <Button type="primary" class="px-3" @click="handleUpload">
                <img
                  src="../../assets/icons/upload.svg"
                  alt="Upload icon"
                  class="w-4"
                />
                <span class="hidden md:block">Upload</span>
              </Button>
              <Button type="ghost" @click="toggleNav" class="lg:hidden">
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
        </div>
      </div>
    </div>

    <nav class="lg:hidden border-b border-grayscale-300" v-show="isOpen">
      <ul class="flex flex-col gap-2 pt-2 bg-white font-poppins font-regular">
        <li
          class="py-2"
          :class="
            route.name === 'Home'
              ? 'bg-primary-100/50 pl-3 border-l-4 border-primary-500 text-primary-600 font-medium'
              : 'pl-4 border-none'
          "
        >
          <RouterLink to="/home">Home</RouterLink>
        </li>
        <li
          class="py-2"
          :class="
            route.name === 'About'
              ? 'bg-primary-100/50 pl-3 border-l-4 border-primary-500 text-primary-600 font-medium'
              : 'pl-4 border-none'
          "
        >
          <RouterLink to="/about">About</RouterLink>
        </li>
        <li
          class="py-2"
          :class="
            route.name === 'Gallery'
              ? 'bg-primary-100/50 pl-3 border-l-4 border-primary-500 text-primary-600 font-medium'
              : 'pl-4 border-none'
          "
        >
          <RouterLink to="/">Explore</RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useHotspotStore } from "../stores/hotspotStore";
import Button from "./Button.vue";

const route = useRoute();
const router = useRouter();
const isOpen = ref(false);

const hotspotStore = useHotspotStore();

const toggleNav = () => {
  isOpen.value = !isOpen.value;
};

const handleSearch = () => {
  router.push("/search");
};

const handleUpload = () => {
  hotspotStore.cleanHotspotState();
  router.push("/upload");
};
</script>
