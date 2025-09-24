<template>
  <div
    v-if="!isEditMode"
    class="relative flex flex-col w-full bg-white rounded-xs px-3 py-2 shadow-sm"
  >
    <h1 class="font-poppins font-medium text-primary-600">
      {{ props.hotspot.label }}
    </h1>
    <div class="relative mb-2">
      <p
        ref="hotspotText"
        class="body text-ellipsis whitespace-pre-line text-grayscale-700 overflow-hidden"
        :class="{ 'max-h-11': isTextClipped }"
      >
        {{ props.hotspot.content }}
      </p>
      <div
        v-show="isTextClipped && textIsOverflowing"
        class="absolute bottom-0 left-0 w-full h-5 pointer-events-none bg-gradient-to-t from-white to-transparent"
      />
    </div>
    <div class="flex justify-between items-center mt-2">
      <div class="flex gap-4 items-center">
        <Button @click="enterHotspotEdit" type="ghost">
          <span class="sr-only">Edit hotspot</span>
          <Icon icon="bx:edit" width="24" />
        </Button>
        <Button @click="deleteCurrentHotspot" type="ghost">
          <span class="sr-only">Delete hotspot</span>
          <Icon icon="bx:trash" width="24" />
        </Button>
      </div>
      <Button v-if="textIsOverflowing" @click="toggleTextClipped" type="ghost">
        <Icon
          :icon="isTextClipped ? 'bx:chevron-down' : 'bx:chevron-up'"
          width="28"
        />
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
      <Button @click="revertHotspotChanges" type="secondary">Cancel</Button>
      <Button @click="saveHotspotChanges" type="success">Save</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from "vue";
import { useHotspotStore } from "../../stores/hotspotStore";
import { storeToRefs } from "pinia";
import { type Hotspot } from "../../types/model";
import Button from "../Button.vue";
import { Icon } from "@iconify/vue";
import InputField from "../InputField.vue";
import TextArea from "../TextArea.vue";

const props = defineProps<{
  hotspotId: number;
  hotspot: Hotspot;
}>();

const hotspotStore = useHotspotStore();
const { requestedDelete } = storeToRefs(hotspotStore);

const isTextClipped = ref(true);
const textIsOverflowing = ref(false);
const hotspotText = useTemplateRef("hotspotText");

const checkIfTextOverflows = () => {
  if (!hotspotText.value) return;

  const el = hotspotText.value;

  textIsOverflowing.value = el.scrollHeight > el.offsetHeight;
};

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
  prevLabel.value = props.hotspot.label;
  prevContent.value = props.hotspot.content;

  setEditMode(true);
};

const revertHotspotChanges = () => {
  props.hotspot.label = prevLabel.value;
  props.hotspot.content = prevContent.value;

  setEditMode(false);
};

const saveHotspotChanges = async () => {
  setEditMode(false);
  await nextTick();
  checkIfTextOverflows();
};

const deleteCurrentHotspot = () => {
  requestedDelete.value = props.hotspotId;
};

onMounted(() => {
  checkIfTextOverflows();
});
</script>
