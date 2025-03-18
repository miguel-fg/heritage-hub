<template>
  <SearchBar />
  <div class="w-full mx-auto mt-32 mb-12 max-w-[1920px]">
    <div
      v-if="emptySearch"
      class="w-full h-[85vh] flex flex-col items-center justify-center gap-5"
    >
      <svg
        width="100"
        height="105"
        viewBox="0 0 100 105"
        xmlns="http://www.w3.org/2000/svg"
        class="fill-grayscale-300"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M50 0L100 24.5667V80.4331L50 105L-5.54865e-06 80.4331V24.5667L50 0ZM9.0909 34.6497V74.8165L45.4545 92.6831V52.5162L9.0909 34.6497ZM54.5455 52.5162V92.6831L90.9091 74.8165V34.6497L77.2727 41.3498L68.1818 45.8166L54.5455 52.5162ZM85.1939 27.3748L73.3497 33.1941C73.0903 32.9812 50.3139 44.8228 50 44.6667L14.8063 27.3748L50 10.083L85.1939 27.3748Z"
        />
      </svg>
      <p class="font-poppins text-grayscale-600 text-pretty text-center">
        Type something to search 3D models
      </p>
    </div>
    <div v-else>
      <h1 class="title">Searching with values:</h1>
      <h2 class="subtitle">
        Query: <span class="font-poppins font-medium">{{ query }}</span>
      </h2>
      <h2 class="subtitle">
        Sort: <span class="font-poppins font-medium">{{ sort }}</span>
      </h2>
      <h2 class="subtitle">
        Tags: <span class="font-poppins font-medium">{{ tags }}</span>
      </h2>
      <h2 class="subtitle">
        Materials:
        <span class="font-poppins font-medium">{{ materials }}</span>
      </h2>
      <h2 class="subtitle">
        Others: <span class="font-poppins font-medium">{{ others }}</span>
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "../components/search/SearchBar.vue";
import { ref, watch } from "vue";
import { useSearchBar } from "../scripts/searchUtils";

const { query, sort, tags, materials, others } = useSearchBar();

const emptySearch = ref(true);

watch([query, sort, tags, materials, others], () => {
  if (
    !query.value &&
    tags.value.length === 0 &&
    materials.value.length === 0 &&
    others.value.length === 0
  ) {
    emptySearch.value = true;
  } else {
    emptySearch.value = false;
  }
});
</script>
