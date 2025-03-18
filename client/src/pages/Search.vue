<template>
  <SearchBar />
  <h1 class="title mt-40">This is the Search Page!</h1>
  <h2>Query: {{ query }}</h2>
  <h2>Sort: {{ sort }}</h2>
  <h2>Tags: {{ tags }}</h2>
  <h2>Materials: {{ materials }}</h2>
  <h2>Downloadable: {{ downloadable }}</h2>
</template>

<script setup lang="ts">
import SearchBar from "../components/search/SearchBar.vue";
import { useSearchBar } from "../scripts/searchUtils";

const { query, sort, tags, materials, downloadable } = useSearchBar();
</script>
