<template>
  <div class="flex flex-col h-screen">
    <NavBar v-if="route.name !== 'Search'" />
    <SearchBar v-else />
    <div
      class="h-full"
      :class="shouldLoadMore ? 'overflow-y-auto px-0' : 'px-4 md:px-8 lg:px-16'"
      ref="app"
    >
      <RouterView />
    </div>
    <Footer v-if="!shouldLoadMore" />
  </div>
</template>

<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
import SearchBar from "./components/search/SearchBar.vue";
import Footer from "./components/Footer.vue";
import { useRoute } from "vue-router";
import { useTemplateRef, computed, watch } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import { useModelStore } from "./stores/modelStore";

const route = useRoute();
const appRef = useTemplateRef("app");
const modelStore = useModelStore();

const shouldLoadMore = computed(
  () => route.name === "Gallery" || route.name === "Search",
);

const loadMore = () => {
  if (shouldLoadMore.value) {
    modelStore.loadMoreModels();
  }
};

watch(
  () => route.name,
  (newRoute, oldRoute) => {
    if (newRoute === "Search" && oldRoute !== "Search") {
      appRef.value?.scrollTo({ top: 0, behavior: "instant" });
    }
  },
);

useInfiniteScroll(appRef, loadMore, {
  canLoadMore: () => shouldLoadMore.value && modelStore.pagination.hasMore,
});
</script>
