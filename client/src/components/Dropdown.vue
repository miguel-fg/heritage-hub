<template>
  <div class="md:relative inline-block">
    <button
      @click.stop.prevent="handleToggle"
      @mouseenter="handleMouseEnter"
      @touchend.stop.prevent
      @touchstart.stop.prevent="handleToggle"
      class="flex gap-2 items-center bg-transparent font-poppins font-medium cursor-pointer"
      :class="
        props.isOpen
          ? 'text-primary-500 border-b border-primary-500'
          : 'text-grayscale-600 border-none'
      "
    >
      {{ props.label }}
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
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      class="absolute mt-2 md:top-full w-screen md:w-fit py-1 md:mt-4 bg-white md:border border-b border-grayscale-300 md:rounded-sm z-50 max-h-[25vh] overflow-y-auto"
      :class="props.align === 'start' ? 'left-0' : 'right-0'"
    >
      <fieldset v-if="props.multiple">
        <legend class="sr-only">{{ props.label }}</legend>
        <div class="flex flex-col gap-4 py-1">
          <div
            v-for="(option, index) in props.options as Array<Options>"
            :key="index"
          >
            <label
              :for="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
              class="flex gap-2 w-full pl-4 pr-6 h-full items-center text-nowrap font-poppins cursor-pointer"
              tabindex="0"
              role="checkbox"
              :aria-checked="model!.includes(option.value)"
              @keydown.enter="
                handleLabelKeydown(
                  $event,
                  `${props.idPrefix}-${props.label}-${option.label}-${index}`,
                )
              "
            >
              <input
                :id="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
                type="checkbox"
                class="sr-only absolute overflow-hidden"
                tabindex="-1"
                :value="option.value"
                v-model="model"
              />
              <span
                class="relative w-4 h-4 rounded-xs border border-grayscale-300 text-grayscale-100 flex items-center justify-center"
              >
                <span
                  v-if="model!.includes(option.value)"
                  class="w-2 h-2 bg-primary-500 rounded-xs"
                ></span>
              </span>
              {{ option.label }}
            </label>
          </div>
        </div>
      </fieldset>
      <fieldset v-else>
        <legend class="sr-only">{{ props.label }}</legend>
        <div class="flex flex-col gap-4">
          <div
            v-for="(option, index) in props.options as Array<Options>"
            class="py-1 pl-2"
            :class="{
              'bg-primary-100/50 border-l-4 border-primary-500 font-medium text-primary-600':
                model === option.value,
            }"
          >
            <label
              class="flex pl-4 pr-6 items-center text-nowrap font-poppins cursor-pointer"
              :for="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
              role="radio"
              tabindex="0"
              :aria-checked="model === option.value"
              @keydown.enter="
                handleLabelKeydown(
                  $event,
                  `${props.idPrefix}-${props.label}-${option.label}-${index}`,
                )
              "
            >
              <input
                type="radio"
                class="sr-only"
                tabindex="-1"
                :id="`${props.idPrefix}-${props.label}-${option.label}-${index}`"
                :value="option.value"
                v-model="model"
              />
              {{ option.label }}
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

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

const model = defineModel<string[] | "newest" | "oldest" | "a-z" | "z-a">();

const emit = defineEmits(["toggle"]);

const isHovering = ref(false);
let closeTimeout: number | null = null;

const handleLabelKeydown = (event: KeyboardEvent, inputId: string) => {
  if (event.key === "Enter") {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.click();
    }
  }
};

const handleToggle = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  emit("toggle");
};

const handleMouseEnter = () => {
  isHovering.value = true;
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  if (!props.isOpen) {
    emit("toggle");
  }
};

const handleMouseLeave = () => {
  isHovering.value = false;

  nextTick(() => {
    if (!isHovering.value) {
      closeTimeout = window.setTimeout(() => {
        if (props.isOpen) {
          emit("toggle");
        }
      }, 1000);
    }
  });
};
</script>
