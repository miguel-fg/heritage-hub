<template>
  <div class="flex flex-col h-screen">
    <UploadModal v-if="isUploadOpen" />
    <ToastPlayer />
    <NavBar v-if="shouldShowNavBar" />
    <SearchBar v-else-if="shouldShowSearchBar" />
    <div
      class="h-full flex-1"
      :class="shouldLoadMore ? 'overflow-y-auto px-0' : ''"
      ref="app"
    >
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
import SearchBar from "./components/search/SearchBar.vue";
import ToastPlayer from "./components/ToastPlayer.vue";
import { useRoute } from "vue-router";
import { useTemplateRef, computed, watch, provide } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import { useModelStore } from "./stores/modelStore";
import { useSearchStore } from "./stores/searchStore";
import UploadModal from "./components/upload/UploadModal.vue";
import { useUpload } from "./scripts/useUpload";

const route = useRoute();
const appRef = useTemplateRef<HTMLElement>("app");
const modelStore = useModelStore();
const searchStore = useSearchStore();
const { isUploadOpen } = useUpload();

const shouldLoadMore = computed(
  () => route.name === "Gallery" || route.name === "Search",
);

const shouldShowNavBar = computed(
  () => route.name !== "Search" && route.name !== "Upload",
);
const shouldShowSearchBar = computed(() => route.name === "Search");

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
    if (route.name === "Gallery" && !modelStore.error) {
      modelStore.loadMoreModels();
    } else if (route.name === "Search" && !searchStore.error) {
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
