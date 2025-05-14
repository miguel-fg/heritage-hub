<template>
  <div
    v-if="!props.editing"
    class="absolute z-40 bottom-2 right-2 py-1 flex flex-col gap-4 bg-grayscale-100 rounded-xs shadow-xs"
  >
    <button
      @click="emit('help')"
      title="Help Menu"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="help" />
    </button>
    <button
      @click="emit('download')"
      title="Download Model"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="download" />
    </button>
    <button
      @click="emit('rotation')"
      title="Play Animation"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon v-show="!props.rotation" action="play" />
      <ToolbarIcon v-show="props.rotation" action="pause" />
    </button>
    <button
      @click="emit('hotspots')"
      title="Toggle Hotspot Visibility"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon v-show="!props.hotspotsVisible" action="show" />
      <ToolbarIcon v-show="props.hotspotsVisible" action="hide" />
    </button>
    <button
      @click="emit('options')"
      title="Toggle Options"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="options" />
    </button>
    <button
      @click="emit('fullscreen')"
      title="Toggle Fullscreen"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="fullscreen" />
    </button>
  </div>
  <div
    v-else
    class="absolute z-40 bottom-2 right-2 py-1 flex flex-col gap-4 bg-grayscale-100 rounded-xs shadow-xs"
  >
    <button
      @click="emit('help')"
      title="Help Menu"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="help" />
    </button>
    <button
      @click="emit('rotation')"
      title="Play Animation"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon v-show="!props.rotation" action="play" />
      <ToolbarIcon v-show="props.rotation" action="pause" />
    </button>
    <button
      @click="emit('options')"
      title="Toggle Options"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="options" />
    </button>

    <button
      @click="emit('fullscreen')"
      title="Toggle Fullscreen"
      class="cursor-pointer hover:bg-grayscale-200"
    >
      <ToolbarIcon action="fullscreen" />
    </button>
  </div>
</template>

<script setup lang="ts">
import ToolbarIcon from "../icons/ToolbarIcon.vue";

const props = defineProps({
  editing: { type: Boolean, default: false },
  rotation: { type: Boolean, required: true },
  hotspotsVisible: { type: Boolean, required: true },
});

const emit = defineEmits([
  "help",
  "download",
  "options",
  "fullscreen",
  "hotspots",
  "rotation",
]);
</script>
