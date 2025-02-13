<template>
  <div class="flex flex-col gap-4">
    <div
      @click="
        () => console.log(`Navigating to Model Page for ID:${props.item.id}`)
      "
      class="flex flex-col gap-1 cursor-pointer"
    >
      <img
        :src="thumbnailUrl"
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
import { ref, onMounted } from "vue";
import { useModelStore } from "../stores/modelStore";
import Tag from "./Tag.vue";
const props = defineProps({
  item: { type: Object, required: true },
  index: Number,
});

const modelStore = useModelStore();
const thumbnailUrl = ref("");

onMounted(async () => {
  thumbnailUrl.value = await modelStore.getThumbnailUrl(props.item.id);
});
</script>
