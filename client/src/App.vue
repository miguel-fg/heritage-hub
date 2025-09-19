<template>
  <div class="flex flex-col h-screen">
    <ToastPlayer />
    <NavBar v-if="shouldShowNavBar" />
    <SearchBar v-else-if="shouldShowSearchBar" />
    <div class="h-full flex-1" ref="app">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
import SearchBar from "./components/search/SearchBar.vue";
import ToastPlayer from "./components/ToastPlayer.vue";
import { useRoute } from "vue-router";
import { useTemplateRef, computed, watch, provide, onMounted } from "vue";
import { useUserStore } from "./stores/userStore";

const route = useRoute();
const appRef = useTemplateRef<HTMLElement>("app");

const userStore = useUserStore();

const shouldShowNavBar = computed(
  () => route.name !== "Search" && route.name !== "Upload",
);
const shouldShowSearchBar = computed(() => route.name === "Search");

watch(
  () => route.name,
  (newRoute, oldRoute) => {
    if (newRoute === "Search" && oldRoute !== "Search") {
      appRef.value?.scrollTo({ top: 0, behavior: "instant" });
    }
  },
);

provide("appRef", appRef);

onMounted(async () => {
  if (userStore.user === null) {
    await userStore.fetchUser();
  }
});
</script>
