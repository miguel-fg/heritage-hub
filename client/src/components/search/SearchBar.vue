<template>
  <div
    ref="searchbarRef"
    class="z-20 top-0 left-0 w-full fixed"
    :style="{ transform: `translateY(${searchbarTransform})` }"
  >
    <div
      class="w-full bg-white px-4 md:px-8 lg:px-16 border-b border-grayscale-300"
    >
      <div class="w-full mx-auto max-w-[1920px]">
        <div class="flex flex-col">
          <div class="flex items-center gap-4 py-2">
            <img
              class="hidden md:block w-10"
              src="/HH_red.svg"
              alt="Heritage Hub logo"
            />
            <label
              for="searchbar"
              class="flex pl-2 border border-grayscale-300 w-full rounded-xs"
            >
              <img
                src="../../../assets/icons/search.svg"
                alt="Search icon"
                class="w-4"
              />
              <input
                id="searchbar"
                type="text"
                class="font-poppins w-full py-1 px-2"
                placeholder="Search"
                v-model="query"
              />
            </label>
            <Button type="outline" @click="handleCancel">Cancel</Button>
          </div>
          <!-- Mobile -->
          <div class="flex md:hidden items-center"></div>
          <!-- Desktop -->
          <div class="hidden md:flex items-center justify-between py-2">
            <div class="flex gap-8">
              <Dropdown
                v-model="tags"
                :options="tagOptions"
                label="Tags"
                multiple
                :isOpen="activeDropdown === 'tags'"
                @toggle="handleDropdownToggle('tags')"
              />
              <Dropdown
                v-model="materials"
                :options="materialOptions"
                label="Materials"
                multiple
                :isOpen="activeDropdown === 'materials'"
                @toggle="handleDropdownToggle('materials')"
              />
              <label
                for="downloadable"
                class="flex gap-2 items-center text-nowrap font-poppins cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="downloadable"
                  class="hidden absolute overflow-hidden"
                  v-model="downloadable"
                />
                <span
                  class="relative w-4 h-4 rounded-xs border border-grayscale-300 text-grayscale-100"
                ></span>
                Downloadable
              </label>
            </div>
            <Dropdown
              v-model="sort"
              :options="sortOptions"
              label="Sort"
              align="end"
              :isOpen="activeDropdown === 'sort'"
              @toggle="handleDropdownToggle('sort')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Button from "../Button.vue";
import Dropdown from "../Dropdown.vue";
import { useSearchBar } from "../../scripts/searchUtils";

const router = useRouter();

const { query, sort, tags, materials, downloadable, resetSearch } =
  useSearchBar();

const activeDropdown = ref<"tags" | "materials" | "sort" | null>(null);

const tagOptions = [
  { value: "tag1", label: "Option 1" },
  { value: "tag2", label: "Option 2" },
  { value: "tag3", label: "Option 3" },
];

const materialOptions = [
  { value: "material1", label: "Option 1" },
  { value: "material2", label: "Option 2" },
  { value: "material3", label: "Option 3" },
];

const sortOptions = [
  { value: "relevant", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A to Z" },
  { value: "z-a", label: "Z to A" },
];

const handleDropdownToggle = (dropdown: "tags" | "materials" | "sort") => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown;
};

const searchbarTransform = ref("0");
const searchbarRef = ref<HTMLElement>();
let lastScroll = 0;
let scrollStartUp = 0;
let scrollStartDown = 0;

const handleScroll = () => {
  const searchbarH = searchbarRef.value?.clientHeight as number;
  const currentScroll = window.scrollY;

  if (currentScroll > lastScroll) {
    if (scrollStartDown === 0) {
      scrollStartDown = currentScroll;
    }

    scrollStartUp = 0;
    searchbarTransform.value = `${scrollStartDown - currentScroll}px`;
  } else if (currentScroll < lastScroll) {
    if (scrollStartUp === 0) {
      scrollStartUp = currentScroll;
    }

    scrollStartDown = 0;
    const scrollDiff = -searchbarH + scrollStartUp - currentScroll;
    searchbarTransform.value = `${scrollDiff < 0 && scrollStartUp > searchbarH ? scrollDiff : 0}px`;
  }

  lastScroll = currentScroll <= 0 ? 0 : currentScroll;
};

const handleCancel = () => {
  resetSearch();
  router.push("/");
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
[type="checkbox"]:checked + span {
  background: var(--color-primary-600);
}

[type="checkbox"]:checked + span:before {
  content: "\2714";
  position: absolute;
  top: -6px;
  left: 2;
}
</style>
