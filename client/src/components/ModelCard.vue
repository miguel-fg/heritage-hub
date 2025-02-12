<template>
  <div class="flex flex-col gap-4 shrink-1 max-w-xs">
    <div
      @click="
        () => console.log(`Navigating to Model Page for ID:${props.item.id}`)
      "
      class="flex flex-col gap-1 cursor-pointer"
    >
      <img
        :src="props.item.thumbnailUrl"
        alt="Model image"
        class="w-full rounded-xs drop-shadow-xs"
      />
      <h1 class="title mt-1 text-primary-500">{{ props.item.name }}</h1>
      <p class="body text-grayscale-900">{{ props.item.caption }}</p>
    </div>
    <div class="flex gap-1 flex-wrap">
      <Tag v-for="tag in props.item.tags" :content="tag" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from "./Tag.vue";
const props = defineProps({
  item: { type: Object, required: true },
  index: Number,
});
</script>
