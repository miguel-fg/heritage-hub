<template>
  <div
    class="flex gap-3 sm:gap-5 md:gap-8 lg:gap-12 w-min px-4 mx-auto items-center"
  >
    <div class="flex gap-2">
      <Button
        @click="goToPage(1)"
        type="outline"
        :disabled="store.pagination.page === 1"
        class="md:hidden size-10"
      >
        <Icon icon="bx:chevrons-left" width="24" />
      </Button>
      <Button
        @click="goToPrevious"
        type="outline"
        :disabled="store.pagination.page === 1"
        class="size-10 gap-1 min-w-fit"
      >
        <Icon icon="bx:chevron-left" width="24" />
        <span class="hidden md:block">Previous</span>
      </Button>
    </div>
    <!-- Desktop controls -->
    <div class="hidden md:flex gap-3 font-poppins text-grayscale-900">
      <button
        v-for="item in pagesToShow"
        @click="typeof item === 'number' && goToPage(item)"
        class="size-10 rounded-xs cursor-pointer"
        :class="[
          item === store.pagination.page
            ? 'bg-primary-100/50 font-bold underline hover:bg-primary-100'
            : 'hover:bg-grayscale-200 active:bg-grayscale-200',
          typeof item === 'number'
            ? ''
            : 'cursor-default pointer-events-none text-grayscale-500',
        ]"
        :disabled="typeof item === 'string'"
      >
        {{ item }}
      </button>
    </div>
    <!-- Mobile controls -->
    <div class="flex md:hidden gap-1 md:gap-3 font-poppins text-grayscale-900">
      <button
        v-for="item in pagesToShowMobile"
        @click="typeof item === 'number' && goToPage(item)"
        class="size-10 rounded-xs cursor-pointer"
        :class="[
          item === store.pagination.page
            ? 'bg-primary-100/50 font-bold underline hover:bg-primary-100'
            : 'hover:bg-grayscale-200 active:bg-grayscale-200',
          typeof item === 'number'
            ? ''
            : 'cursor-default pointer-events-none text-grayscale-500',
        ]"
        :disabled="typeof item === 'string'"
      >
        {{ item }}
      </button>
    </div>
    <div class="flex gap-2">
      <Button
        @click="goToNext"
        type="outline"
        :disabled="store.pagination.page === totalPages"
        class="size-10 gap-1 min-w-fit"
      >
        <span class="hidden md:block">Next</span>
        <Icon icon="bx:chevron-right" width="24" />
      </Button>
      <Button
        @click="goToPage(totalPages)"
        type="outline"
        :disabled="store.pagination.page === totalPages"
        class="md:hidden size-10"
      >
        <Icon icon="bx:chevrons-right" width="24" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "../stores/modelStore";
import { useSearchStore } from "../stores/searchStore";
import Button from "../components/Button.vue";
import { useSearchBar } from "../scripts/searchUtils";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  storeType: "model" | "search";
}>();

const modelStore = useModelStore();
const searchStore = useSearchStore();

const store = computed(() =>
  props.storeType === "model" ? modelStore : searchStore,
);

const router = useRouter();

const totalPages = computed(() =>
  Math.ceil(store.value.pagination.total / store.value.pagination.limit),
);

const pagesToShow = computed(() => {
  const current = store.value.pagination.page;
  const total = totalPages.value;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5, "...", total);
    } else if (current >= total - 2) {
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
  }

  return pages;
});

const pagesToShowMobile = computed(() => {
  const current = store.value.pagination.page;
  const total = totalPages.value;
  const pages: (number | string)[] = [];

  if (total <= 3) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current === 1) {
      pages.push(1, 2, 3);
    } else if (current === total) {
      pages.push(total - 2, total - 1, total);
    } else {
      pages.push(current - 1, current, current + 1);
    }
  }
  return pages;
});

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return;

  const skip = (page - 1) * store.value.pagination.limit;

  if (props.storeType === "model") {
    router.push({ path: "/", query: { page } });
  } else {
    const { query, tags, materials, sort, others } = useSearchBar();
    await searchStore.searchModels({
      query: query.value,
      tags: tags.value,
      materials: materials.value,
      sort: sort.value,
      others: others.value,
      limit: store.value.pagination.limit,
      skip,
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
};

const goToPrevious = async () => {
  if (store.value.pagination.page > 1)
    await goToPage(store.value.pagination.page - 1);
};

const goToNext = async () => {
  if (store.value.pagination.page < totalPages.value)
    await goToPage(store.value.pagination.page + 1);
};
</script>
