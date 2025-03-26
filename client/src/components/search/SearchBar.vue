<template>
  <div class="w-full">
    <div
      class="w-full bg-white px-4 md:px-8 border-b border-grayscale-300 lg:px-16"
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
                alt="Search bar"
                class="w-4"
              />
              <input
                id="searchbar"
                type="text"
                class="font-poppins w-full py-1 px-2"
                placeholder="Search"
                v-model="query"
                v-focus
              />
            </label>
            <Button type="outline" @click="handleCancel">Cancel</Button>
          </div>
          <!-- Mobile -->
          <div class="flex md:hidden items-center justify-between py-2">
            <!-- Filter submenu -->
            <div class="relative flex gap-6 sm:gap-10 items-center">
              <button
                @click="toggleFiltersOpen"
                class="flex gap-2 items-center bg-transparent font-poppins font-medium cursor-pointer"
                :class="
                  isFiltersOpen
                    ? 'text-primary-500 border-b border-primary-500'
                    : 'text-grayscale-600 border-none'
                "
              >
                <span>Filters</span>

                <svg
                  v-if="!isFiltersOpen"
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.99993 7.2055L14.7006 0L16 1.39726L7.99993 10L0 1.39726L1.29936 0L7.99993 7.2055Z"
                    fill="#615F5F"
                  />
                </svg>
                <svg
                  v-else
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.00004 2.79451L1.29936 10L0 8.60269L8.00004 0L16 8.60269L14.7006 10L8.00004 2.79451Z"
                    fill="#A0182C"
                  />
                </svg>
              </button>
              <Button v-show="filtersActive" @click="clearFilters" type="danger"
                >Reset</Button
              >
              <div
                v-if="isFiltersOpen"
                class="absolute -left-4 top-full w-screen flex justify-between px-4 py-2 bg-white border-b border-grayscale-300"
              >
                <Dropdown
                  v-model="tags"
                  :options="tagOptions"
                  label="Tags"
                  multiple
                  :isOpen="activeDropdown === 'tags'"
                  @toggle="handleDropdownToggle('tags')"
                  idPrefix="mobile"
                />
                <Dropdown
                  v-model="materials"
                  :options="materialOptions"
                  label="Materials"
                  multiple
                  :isOpen="activeDropdown === 'materials'"
                  @toggle="handleDropdownToggle('materials')"
                  idPrefix="mobile"
                />
                <Dropdown
                  v-model="others"
                  :options="otherOptions"
                  label="Others"
                  multiple
                  align="end"
                  :isOpen="activeDropdown === 'others'"
                  @toggle="handleDropdownToggle('others')"
                  idPrefix="mobile"
                />
              </div>
            </div>
            <Dropdown
              v-model="sort"
              :options="sortOptions"
              label="Sort"
              :isOpen="activeDropdown === 'sort'"
              @toggle="
                () => {
                  handleDropdownToggle('sort');
                  isFiltersOpen = false;
                }
              "
              align="end"
              idPrefix="mobile"
            />
          </div>
          <!-- Desktop -->
          <div class="hidden md:flex items-center justify-between py-2">
            <div class="flex gap-8 items-center">
              <Dropdown
                v-model="tags"
                :options="tagOptions"
                label="Tags"
                multiple
                :isOpen="activeDropdown === 'tags'"
                @toggle="handleDropdownToggle('tags')"
                idPrefix="desktop"
              />
              <Dropdown
                v-model="materials"
                :options="materialOptions"
                label="Materials"
                multiple
                :isOpen="activeDropdown === 'materials'"
                @toggle="handleDropdownToggle('materials')"
                idPrefix="desktop"
              />
              <div v-for="(option, index) in otherOptions">
                <label
                  :for="`${option.label}-${index}`"
                  class="flex gap-2 items-center text-nowrap font-poppins cursor-pointer"
                  tabindex="0"
                  @keydown.enter="
                    handleLabelKeydown($event, `${option.label}-${index}`)
                  "
                  role="checkbox"
                  :aria-checked="others.includes(option.value)"
                >
                  <input
                    type="checkbox"
                    :id="`${option.label}-${index}`"
                    class="sr-only absolute overflow-hidden"
                    tabindex="-1"
                    :value="option.value"
                    v-model="others"
                  />
                  <span
                    class="relative w-4 h-4 rounded-xs border border-grayscale-300 text-grayscale-100 flex items-center justify-center"
                  >
                    <span
                      v-if="others.includes(option.value)"
                      class="w-2 h-2 bg-primary-500 rounded-xs"
                    ></span>
                  </span>
                  {{ option.label }}
                </label>
              </div>
              <Button v-show="filtersActive" @click="clearFilters" type="danger"
                >Reset</Button
              >
            </div>
            <Dropdown
              v-model="sort"
              :options="sortOptions"
              label="Sort"
              align="end"
              :isOpen="activeDropdown === 'sort'"
              @toggle="handleDropdownToggle('sort')"
              idPrefix="desktop"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "../Button.vue";
import Dropdown from "../Dropdown.vue";
import { useSearchBar } from "../../scripts/searchUtils";
import { useSearchStore } from "../../stores/searchStore.ts";

const router = useRouter();
const searchStore = useSearchStore();

const {
  query,
  sort,
  tags,
  materials,
  others,
  tagOptions,
  materialOptions,
  sortOptions,
  otherOptions,
  clearFilters,
  resetSearch,
} = useSearchBar();

const activeDropdown = ref<"tags" | "materials" | "sort" | "others" | null>(
  null,
);
const isFiltersOpen = ref(false);

const handleDropdownToggle = (
  dropdown: "tags" | "materials" | "sort" | "others",
) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown;
};

const toggleFiltersOpen = () => {
  if (activeDropdown.value === "sort") {
    activeDropdown.value = null;
  }

  isFiltersOpen.value = !isFiltersOpen.value;
};

const filtersActive = computed(
  () =>
    tags.value.length !== 0 ||
    materials.value.length !== 0 ||
    others.value.length !== 0,
);

const handleLabelKeydown = (event: KeyboardEvent, inputId: string) => {
  if (event.key === "Enter") {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.click();
    }
  }
};

const handleCancel = () => {
  resetSearch();
  searchStore.resetPagination();
  router.push("/");
};

const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
};
</script>
