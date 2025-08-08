<template>
  <div
    class="flex gap-3 sm:gap-5 md:gap-8 lg:gap-12 w-min px-4 mx-auto items-center"
  >
    <div class="flex gap-2">
      <Button @click="goToPage(1)" type="outline" class="md:hidden size-10">
        <GoToFirstIcon />
      </Button>
      <Button @click="goToPrevious" type="outline" class="size-10 gap-2">
        <BackPageIcon />
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
          item === dummyPagination.page
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
          item === dummyPagination.page
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
      <Button @click="goToNext" type="outline" class="size-10 gap-2">
        <span class="hidden md:block">Next</span>
        <NextPageIcon />
      </Button>
      <Button
        @click="goToPage(totalPages)"
        type="outline"
        class="md:hidden size-10"
      >
        <GoToLastIcon />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "../components/Button.vue";
import BackPageIcon from "../components/icons/BackPageIcon.vue";
import NextPageIcon from "../components/icons/NextPageIcon.vue";
import GoToFirstIcon from "./icons/GoToFirstIcon.vue";
import GoToLastIcon from "./icons/GoToLastIcon.vue";

const dummyPagination = ref({
  page: 1,
  limit: 18,
  hasMore: true,
  total: 200,
});

const totalPages = computed(() =>
  Math.ceil(dummyPagination.value.total / dummyPagination.value.limit),
);

const pagesToShow = computed(() => {
  const current = dummyPagination.value.page;
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
  const current = dummyPagination.value.page;
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

const goToPage = (page: number) => {
  dummyPagination.value.page = page;
};

const goToPrevious = () => {
  if (dummyPagination.value.page > 1) dummyPagination.value.page--;
};

const goToNext = () => {
  if (dummyPagination.value.page < totalPages.value)
    dummyPagination.value.page++;
};
</script>
