<template>
  <div>
    <h1 class="title">This is a Title</h1>
    <h2 class="subtitle">This is a subtitle</h2>
    <p class="body">This is body text</p>
    <div class="tag">This is a tag</div>
    <div class="flex flex-col gap-4">
      <Button type="primary" @clicked="testPrimary">
        <img src="../assets/icons/upload.svg" alt="Upload icon" class="w-3" />
        <span>Upload</span>
      </Button>
      <Button type="secondary" @clicked="testSecondary">
        <span>Secondary</span>
      </Button>
      <Button type="ghost" @clicked="testGhost">
        <span>Ghost</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "./components/Button.vue";

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
