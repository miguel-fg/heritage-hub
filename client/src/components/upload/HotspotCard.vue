<template>
  <div
    v-if="!isEditMode"
    class="relative flex flex-col w-full bg-white rounded-xs px-3 py-2 shadow-sm"
  >
    <Button
      @click="toggleMenu"
      type="ghost-icon"
      class="absolute top-0 right-1"
    >
      <MenuIcon :width="19" :height="24" />
    </Button>
    <h1 class="font-poppins font-medium text-primary-600">
      {{ props.hotspot.label }}
    </h1>
    <p
      class="body text-ellipsis whitespace-pre-line text-grayscale-700 overflow-hidden mb-2"
      :class="{ 'max-h-11': isTextClipped }"
    >
      {{ props.hotspot.content }}
    </p>
    <Button @click="toggleTextClipped" type="ghost" class="text-xs">
      {{ isTextClipped ? "Read more" : "Read less" }}
    </Button>
    <!-- Options menu -->
    <div
      v-if="menuOpen"
      ref="optionsMenu"
      class="absolute -top-1 -translate-y-full right-0 flex flex-col gap-2 divide-y-1 px-2 py-1 divide-grayscale-300 bg-grayscale-200 rounded-xs shadow-xs"
    >
      <Button
        @click="enterHotspotEdit"
        type="ghost"
        class="w-full text-grayscale-800"
      >
        <EditIcon :size="12" />
        <span class="tag">Edit</span>
      </Button>
      <Button
        @click="deleteCurrentHotspot"
        type="ghost"
        class="w-full text-grayscale-800"
      >
        <DeleteIcon :width="10" :height="12" />
        <span class="tag">Delete</span>
      </Button>
    </div>
  </div>
  <!-- Editing Hotspot -->
  <div
    v-else
    class="flex flex-col w-full rounded-xs px-3 py-2 gap-2 border border-grayscale-300"
  >
    <div class="flex flex-col gap-1">
      <InputField
        field-id="hotspot-label"
        label="Label"
        v-model="props.hotspot.label"
      />
      <TextArea
        field-id="hotspot-content"
        label="Content"
        v-model="props.hotspot.content"
        :rows="2"
      />
    </div>
    <div class="flex justify-between">
      <Button @click="revertHotspotChanges" type="secondary"
        >Cancel edit</Button
      >
      <Button @click="saveHotspotChanges" type="success">Save changes</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useHotspotStore } from "../../stores/hotspotStore";
import { storeToRefs } from "pinia";
import { type Hotspot } from "../../types/model";
import Button from "../Button.vue";
import MenuIcon from "../icons/MenuIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import InputField from "../InputField.vue";
import TextArea from "../TextArea.vue";

const props = defineProps<{
  hotspotId: number;
  hotspot: Hotspot;
}>();

const hotspotStore = useHotspotStore();
const { requestedDelete } = storeToRefs(hotspotStore);

const menuOpen = ref(false);
const optionsMenu = useTemplateRef<HTMLElement>("optionsMenu");

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const isTextClipped = ref(true);

const toggleTextClipped = () => {
  isTextClipped.value = !isTextClipped.value;
};

const isEditMode = ref(false);
const prevLabel = ref("");
const prevContent = ref("");

const setEditMode = (active: boolean) => {
  isEditMode.value = active;
};

const enterHotspotEdit = () => {
  menuOpen.value = false;
  prevLabel.value = props.hotspot.label;
  prevContent.value = props.hotspot.content;

  setEditMode(true);
};

const revertHotspotChanges = () => {
  props.hotspot.label = prevLabel.value;
  props.hotspot.content = prevContent.value;

  setEditMode(false);
};

const saveHotspotChanges = () => {
  setEditMode(false);
};

const deleteCurrentHotspot = () => {
  menuOpen.value = false;
  requestedDelete.value = props.hotspotId;
};

onClickOutside(optionsMenu, () => (menuOpen.value = false));
</script>
