<template>
  <div class="flex flex-col gap-4">
    <div
      @click="handleNavigation"
      class="flex flex-col gap-1 cursor-pointer transform transition duration-500 md:hover:scale-107"
    >
      <img
        :src="thumbnailUrl"
        alt="Model image"
        class="w-full rounded-xs drop-shadow-xs"
      />
      <h1 class="title mt-1 text-primary-500">
        {{ props.item.name }}
      </h1>
      <p class="body text-grayscale-900">{{ props.item.caption }}</p>
      <div
        class="flex items-center justify-center py-1 font-medium font-poppins rounded-xs bg-grayscale-100 text-primary-500 border-1 border-primary-300 md:hidden hover:bg-grayscale-200"
      >
        View More
      </div>
    </div>
    <div class="flex gap-1 flex-wrap">
      <Tag v-for="tag in props.item.tags" :content="tag" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useModelStore } from "../stores/modelStore";
import Tag from "./Tag.vue";

const props = defineProps({
  item: { type: Object, required: true },
  index: Number,
});

const modelStore = useModelStore();
const thumbnailUrl = ref("");

const router = useRouter();

const handleNavigation = () => {
  router.push({ name: "Model", params: { id: props.item.id } });
};

onMounted(async () => {
  thumbnailUrl.value = await modelStore.getThumbnailUrl(props.item.id);
});
</script>
