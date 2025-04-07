<template>
  <div class="flex flex-col gap-1 w-full">
    <label
      class="subtitle text-primary-500"
      :for="`${props.dimension}-num-input`"
    >
      {{ dimensions[props.dimension].name }}
    </label>
    <div class="flex body gap-2 w-full">
      <input
        type="number"
        :id="`${props.dimension}-num-input`"
        placeholder="123.45"
        class="px-2 py-0.5 bg-white rounded-xs border border-grayscale-300 w-full"
        min="0"
        v-model="value"
      />
      <v-select
        class="dimension-chooser w-56"
        :inputId="`${props.dimension}-unit-input`"
        :options="dimensionUnits"
        transition=""
        placeholder="Unit"
        :components="{ OpenIndicator, Deselect: DeselectDimension }"
        v-model="unit"
      >
      </v-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import OpenIndicator from "./upload/OpenIndicator.vue";
import DeselectDimension from "./upload/DeselectDimension.vue";
import { computed, ref, watch } from "vue";
import { useDimensions } from "../scripts/useDimensions";

type DimensionKey = "width" | "height" | "depth" | "weight" | "volume";

const props = defineProps<{
  dimension: DimensionKey;
}>();

const value = ref<number | null>(null);
const unit = ref<string | null>(null);

const { dimensions, setValue, setUnit } = useDimensions();

const dimensionUnits = computed(() => dimensions.value[props.dimension].units);

watch(value, (val) => {
  if (val && val < 0) {
    value.value = 0;
  }
  setValue(props.dimension, val);
});

watch(unit, (val) => {
  setUnit(props.dimension, val);
});
</script>

<style>
.dimension-chooser {
  background: white;
}

.dimension-chooser .vs__dropdown-toggle {
  border: 1px solid var(--color-grayscale-300);
  border-radius: var(--radius-xs);
}

.dimension-chooser .vs__search::placeholder {
  color: var(--color-grayscale-500);
}

.dimension-chooser .vs__dropdown-option--highlight {
  background: var(--color-primary-500);
  color: white;
}

.dimension-chooser .vs__dropdown-option--selected {
  background: var(--color-primary-500);
  color: white;
}
</style>
