<template>
  <div
    class="absolute z-40 bottom-2 right-2 py-1 flex flex-col gap-4"
    :class="iconColour"
  >
    <button
      v-if="showHelp"
      @click="emit('help')"
      title="Help Menu"
      class="cursor-pointer hover:bg-grayscale-100 hover:text-grayscale-900 active:bg-grayscale-200 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon icon="bx:question-mark" width="25" class="m-auto" />
    </button>
    <button
      v-if="!props.editing && props.showDownload"
      @click="emit('download')"
      title="Download Model"
      class="cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200 hover:text-grayscale-900 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon icon="bx:download" width="25" class="m-auto" />
    </button>
    <button
      @click="emit('rotation')"
      title="Play Animation"
      class="cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200 hover:text-grayscale-900 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon v-show="!props.rotation" icon="bx:play" width="30" class="m-auto" />
      <Icon v-show="props.rotation" icon="bx:pause" width="30" class="m-auto" />
    </button>
    <button
      @click="emit('hotspots')"
      title="Toggle Hotspot Visibility"
      class="cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200 hover:text-grayscale-900 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon
        v-show="!props.hotspotsVisible"
        icon="bx:hide"
        width="25"
        class="m-auto"
      />
      <Icon
        v-show="props.hotspotsVisible"
        icon="bx:show"
        width="25"
        class="m-auto"
      />
    </button>
    <button
      @click="emit('options')"
      title="Toggle Options"
      class="cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200 hover:text-grayscale-900 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon icon="bx:cog" width="25" class="m-auto" />
    </button>
    <button
      @click="emit('fullscreen')"
      title="Toggle Fullscreen"
      class="cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200 hover:text-grayscale-900 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon icon="bx:fullscreen" width="30" class="m-auto" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useToolbar } from "../../scripts/useToolbar";

const props = defineProps({
  editing: { type: Boolean, default: false },
  rotation: { type: Boolean, required: true },
  hotspotsVisible: { type: Boolean, required: true },
  showDownload: { type: Boolean, required: true },
});

const { selectedBgColor } = useToolbar();

const emit = defineEmits([
  "help",
  "download",
  "options",
  "fullscreen",
  "hotspots",
  "rotation",
]);

const route = useRoute();

const showHelp = computed(() => route.name === "Model");
const iconColour = computed(() =>
  selectedBgColor.value === "white"
    ? "text-grayscale-700"
    : "text-grayscale-100",
);
</script>
