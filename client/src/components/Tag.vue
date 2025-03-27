<template>
  <div
    class="tag px-2 py-1 rounded-xs drop-shadow-xs bg-grayscale-200 text-grayscale-700 cursor-pointer hover:bg-grayscale-300 hover:text-grayscale-800 active:bg-grayscale-700 active:text-grayscale-100"
    @click="handleTagClick"
  >
    {{ props.content }}
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useSearchBar } from "../scripts/searchUtils";
import type { Ref } from "vue";
import { inject, nextTick } from "vue";

const props = defineProps({
  content: { type: String, required: true },
});

const route = useRoute();
const router = useRouter();
const { tags, resetSearch } = useSearchBar();

const appRef = inject<Ref<HTMLElement>>("appRef");

const handleTagClick = () => {
  resetSearch();
  tags.value = [props.content];

  if (route.name !== "Search") {
    router.push("/search");
  } else {
    nextTick(() => {
      if (appRef) {
        appRef.value?.scrollTo({ top: 0, behavior: "instant" });
      }
    });
  }
};
</script>
