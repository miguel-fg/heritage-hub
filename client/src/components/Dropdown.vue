<template>
  <div class="md:relative inline-block">
    <button
      @click="handleToggle"
      class="flex gap-2 items-center bg-transparent font-poppins font-medium cursor-pointer"
      :class="
        props.isOpen
          ? 'text-primary-500 border-b border-primary-500'
          : 'text-grayscale-600 border-none'
      "
    >
      <span>{{ props.label }}</span>
      <svg
        v-if="!props.isOpen"
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

    <div
      v-if="props.isOpen"
      class="absolute mt-2 md:top-full w-screen md:w-fit py-1 pr-2 md:mt-4 bg-white md:border border-b border-grayscale-300 md:rounded-sm z-50 max-h-[25vh] overflow-y-auto"
      :class="props.align === 'start' ? 'left-0' : 'right-0'"
    >
      <div v-if="props.multiple" class="flex flex-col gap-4 px-4 py-1">
        <div
          v-for="(option, index) in props.options as Array<Options>"
          :key="index"
        >
          <label
            :for="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
            class="flex gap-2 items-center text-nowrap font-poppins cursor-pointer"
          >
            <input
              :id="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
              type="checkbox"
              class="hidden absolute overflow-hidden"
              :value="option.value"
              v-model="model"
            />
            <span
              class="relative w-4 h-4 rounded-xs border border-grayscale-300 text-grayscale-100"
            ></span>
            {{ option.label }}
          </label>
        </div>
      </div>
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="(option, index) in props.options as Array<Options>"
          class="py-1 border-l-4 border-white"
          :class="{ 'selected-option': model === option.value }"
        >
          <label
            class="flex px-4 items-center text-nowrap font-poppins cursor-pointer"
            :for="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
          >
            <input
              type="radio"
              class="hidden"
              :id="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
              :value="option.value"
              v-model="model"
            />
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Options {
  value: string;
  label: string;
}

const props = defineProps({
  options: {
    type: Array,
    required: true,
    validator: (value: Array<Options>) =>
      value.every((option) => option.value && option.label),
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  align: {
    type: String,
    default: "start",
    validator: (value: string) => ["start", "end"].includes(value),
  },
  label: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  idPrefix: { type: String, required: false },
});

const model = defineModel();

const emit = defineEmits(["toggle"]);

const handleToggle = () => {
  emit("toggle");
};
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

.selected-option {
  background-color: var(--color-primary-100);
  border-left: 4px solid var(--color-primary-500);
  font-weight: 500;
  color: var(--color-primary-600);
}
</style>
