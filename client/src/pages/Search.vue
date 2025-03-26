<template>
  <div class="w-full" :class="shouldBlur ? 'blur-sm' : 'blur-none'">
    <div class="w-full @container">
      <div
        class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
      >
        <div
          v-if="
            !searchStore.loading ||
            (searchStore.models && searchStore.models.length > 0)
          "
          class="w-full"
        >
          <ul
            class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-12"
          >
            <li v-for="model in searchStore.models" class="w-full">
              <ModelCard :item="model" :key="model.id" />
            </li>
          </ul>

          <!-- Loading indicator at bottom for more items -->
          <div
            v-if="searchStore.loading && !shouldBlur"
            class="mt-8 mb-12 text-center"
          >
            <div role="status">
              <svg
                aria-hidden="true"
                class="inline w-12 h-12 text-grayscale-200 animate-spin fill-primary-500"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span class="sr-only">Loading more models...</span>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="
            !searchStore.loading && searchStore.error && !searchStore.models
          "
          class="flex flex-col text-grayscale-500"
        >
          <h1 class="title text-5xl text-wrap mb-8">Error fetching models.</h1>
          <h1 class="title text-7xl">:(</h1>
        </div>
      </div>

      <!-- End of list footer -->
      <div
        v-if="
          !searchStore.loading &&
          searchStore.models &&
          searchStore.models.length > 0 &&
          !searchStore.pagination.hasMore
        "
        class="w-full mt-40"
      >
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModelCard from "../components/ModelCard.vue";
import Footer from "../components/Footer.vue";
import { useDebounceFn } from "@vueuse/core";
import { ref, watch, onMounted } from "vue";
import { useSearchBar } from "../scripts/searchUtils";
import { useSearchStore } from "../stores/searchStore";
import { useModelStore } from "../stores/modelStore";
import { storeToRefs } from "pinia";

const shouldBlur = ref(false);
const searchStore = useSearchStore();
const modelStore = useModelStore();

const { query, sort, tags, materials, others } = useSearchBar();
const { models: searchModels } = storeToRefs(searchStore);
const { models: galleryModels } = storeToRefs(modelStore);

const debouncedSearch = useDebounceFn(() => {
  searchStore.searchModels({
    query: query.value,
    tags: tags.value,
    materials: materials.value,
    others: others.value,
    sort: sort.value,
  });
}, 800);

watch([query, tags, materials, others, sort], () => {
  shouldBlur.value = true;
  debouncedSearch();
});

watch(
  () => searchStore.loading,
  () => {
    if (!searchStore.loading) {
      shouldBlur.value = false;
    }
  },
);

onMounted(() => {
  if (!searchStore.models) {
    searchModels.value = galleryModels.value;
  }
});
</script>
