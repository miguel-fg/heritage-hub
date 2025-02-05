<template>
  <div class="flex flex-col h-screen">
    <NavBar />
    <div class="grow px-4 md:px-8 lg:px-16">
      <h1 class="title">This is a Title</h1>
      <h2 class="subtitle">This is a subtitle</h2>
      <p class="body">This is body text</p>
      <div class="tag">This is a tag</div>
      <div class="flex flex-col gap-4">
        <Button type="primary" @click="testPrimary">
          <img src="../assets/icons/upload.svg" alt="Upload icon" class="w-3" />
          <span>Upload</span>
        </Button>
        <Button type="secondary" @click="testSecondary">
          <span>Secondary</span>
        </Button>
        <Button type="ghost" @click="testGhost">
          <span>Ghost</span>
        </Button>
      </div>
      <ModelCard
        v-for="(item, index) in data"
        :item="item"
        :key="item.id"
        :index="index"
      />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Button from "./components/Button.vue";
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import ModelCard from "./components/ModelCard.vue";
import data from "./modelTable.json";

const testPrimary = () => {
  console.log("Primary test! :D");
};

const testSecondary = () => {
  console.log("Secondary test! :)");
};

const testGhost = () => {
  console.log("Ghost test! :P");
};
</script>
