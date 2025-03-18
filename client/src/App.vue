<template>
  <div class="flex flex-col h-screen">
    <NavBar v-if="route.name !== 'Search'" />
    <div class="grow px-4 md:px-8 lg:px-16">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
