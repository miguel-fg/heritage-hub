<template>
  <div v-if="!loading && options" class="flex flex-col w-full gap-1">
    <label :for="`${props.fieldId}`" class="subtitle text-primary-500">{{
      props.label
    }}</label>
    <v-select
      class="w-full multiselect-chooser"
      :inputId="`${props.fieldId}`"
      multiple
      taggable
      :options="options"
      label="label"
      :components="{ OpenIndicator, Deselect: DeselectMultiselect }"
      v-model="model"
    >
    </v-select>
  </div>
  <div role="status" class="flex flex-col w-1/2" v-else-if="loading">
    <span class="subtitle text-primary-500">{{ props.label }}</span>
    <svg
      aria-hidden="true"
      class="inline mx-auto w-5 h-5 text-grayscale-200 animate-spin fill-primary-500"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span class="sr-only">Loading {{ props.label }} multiselect...</span>
  </div>
  <div v-else-if="!loading && error" class="flex flex-col w-full gap-1">
    <label :for="`${props.fieldId}`" class="subtitle text-primary-500">{{
      props.label
    }}</label>
    <v-select
      class="w-full multiselect-chooser"
      :inputId="`${props.fieldId}`"
      :placeholder="`Could not fetch ${props.label} options :(`"
      :components="{ OpenIndicator, Deselect: DeselectMultiselect }"
      disabled
    >
    </v-select>
  </div>
  <div v-else class="flex flex-col w-full gap-1">
    <label :for="`${props.fieldId}`" class="subtitle text-primary-500">
      {{ props.label }}
    </label>
    <v-select
      class="w-full multiselect-chooser"
      :inputId="`${props.fieldId}`"
      :components="{ OpenIndicator, Deselect: DeselectMultiselect }"
      disabled
    >
    </v-select>
  </div>
</template>

<script setup lang="ts">
import vSelect from "vue-select";
import OpenIndicator from "./upload/OpenIndicator.vue";
import DeselectMultiselect from "./upload/DeselectMultiselect.vue";
import "vue-select/dist/vue-select.css";
import { ref, watch } from "vue";
import { useSearchBar } from "../scripts/searchUtils";
import { useModelStore } from "../stores/modelStore";
import { storeToRefs } from "pinia";

interface Option {
  value: string;
  label: string;
}

const props = defineProps<{
  label: "Tags" | "Materials";
  fieldId: string;
}>();

const { fetchTags, fetchMaterials } = useSearchBar();

const modelStore = useModelStore();
const { modelLoaded } = storeToRefs(modelStore);

const loading = ref(false);
const options = ref<Option[] | null>(null);
const error = ref<any>(null);

const model = defineModel<Option[] | null>();

watch(modelLoaded, async (loaded) => {
  if (loaded && !options.value) {
    loading.value = true;
    try {
      if (props.label === "Tags") {
        options.value = await fetchTags();
      } else if (props.label === "Materials") {
        options.value = await fetchMaterials();
      }
    } catch (err) {
      console.error("[Multiselect.vue] Error fetching options. ERR: ", err);
      error.value = err;
    } finally {
      loading.value = false;
      modelStore.setModelLoaded(false);
    }
  }
});
</script>

<style>
.multiselect-chooser {
  background: white;
}

.multiselect-chooser .vs__dropdown-toggle {
  border: 1px solid var(--color-grayscale-300);
  border-radius: var(--radius-xs);
}

.multiselect-chooser .vs__search::placeholder {
  color: var(--color-grayscale-500);
}

.multiselect-chooser .vs__dropdown-option {
  font-family: var(--font-garamond);
  font-weight: 400;
  font-size: 1rem;
}

.multiselect-chooser .vs__dropdown-option--highlight {
  background: var(--color-primary-500);
  color: white;
}

.multiselect-chooser .vs__dropdown-option--selected {
  background: var(--color-grayscale-200);
  color: var(--color-grayscale-900);
}

.multiselect-chooser .vs__selected {
  font-family: var(--font-poppins);
  font-weight: 500;
  font-size: 0.75rem;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: 2px;
  border: none;
  background: var(--color-grayscale-200);
  color: var(--color-grayscale-700);
  display: flex;
  gap: 10px;
}
</style>
