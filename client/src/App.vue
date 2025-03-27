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
import { useTemplateRef, computed, watch, provide } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import { useModelStore } from "./stores/modelStore";
import { useSearchStore } from "./stores/searchStore";

const route = useRoute();
const appRef = useTemplateRef<HTMLElement>("app");
const modelStore = useModelStore();
const searchStore = useSearchStore();

const shouldLoadMore = computed(
  () => route.name === "Gallery" || route.name === "Search",
);

const hasMore = computed(() => {
  if (route.name === "Gallery") {
    return modelStore.pagination.hasMore;
  } else if (route.name === "Search") {
    return searchStore.pagination.hasMore;
  } else {
    return false;
  }
});

const loadMore = () => {
  if (shouldLoadMore.value) {
    if (route.name === "Gallery") {
      modelStore.loadMoreModels();
    } else if (route.name === "Search") {
      searchStore.searchMoreModels();
    }
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
  canLoadMore: () => shouldLoadMore.value && hasMore.value,
});

provide("appRef", appRef);
</script>
