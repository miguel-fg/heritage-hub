<template>
  <div
    ref="fsContainer"
    class="relative flex w-full h-full rounded-sm bg-white overflow-hidden shadow-sm"
  >
    <!-- Loading model -->
    <div
      v-if="loading"
      class="absolute top-0 left-0 z-50 w-full h-full flex flex-col justify-center items-center"
    >
      <h1 class="subtitle text-grayscale-900">Loading 3D Model</h1>
      <div class="bg-grayscale-100 h-2 w-2/3 rounded-xs">
        <div
          class="h-full bg-primary-500 transition-all duration-300 ease-out"
          :style="{ width: `${loadingProgress}%` }"
        ></div>
      </div>
    </div>
    <!-- Flash overlay -->
    <div
      class="absolute opacity-0 transition-opacity duration-150 top-0 left-0 z-40 w-full h-full bg-white pointer-events-none"
      :class="{ 'opacity-90': showFlash }"
    ></div>
    <Toolbar
      :editing="props.editing"
      :rotation="rotation"
      :hotspots-visible="areHSVisible"
      :show-download="props.downloadable"
      @fullscreen="toggleFullscreen(fsContainer)"
      @download="downloadModel(downloadLink, objectUrl)"
      @hotspots="handleToolbarHSToggle"
      @options="toggleOptionsMenu"
      @rotation="toggleRotate"
      @help="toggleHelpOverlay"
    />
    <HelpOverlay
      v-show="isHelpOpen"
      @click="toggleHelpOverlay"
      state="visiting"
    />
    <OptionsOverlay v-show="isOptionsOpen" state="visiting" :values="values" />
    <OpenHotspot
      v-show="isHotspotOpen"
      :hotspotId="selectedHotspotID"
      @close="closeHotspot"
      @edit="editHotspot"
      @delete="deleteHotspot"
    />
    <!-- Three js renderer -->
    <div
      ref="container"
      class="flex w-full h-full"
      @click="handleModelClick"
      @mousemove="throttledMouseMove"
      :class="
        !hotspotStore.isHotspotMode
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-crosshair'
      "
    ></div>
    <a ref="downloadLink" class="hidden"></a>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, ref, watch, onBeforeUnmount } from "vue";
import { useHotspotStore } from "../../stores/hotspotStore";
import { useToolbar } from "../../scripts/useToolbar";
import Toolbar from "./Toolbar.vue";
import HelpOverlay from "./HelpOverlay.vue";
import OptionsOverlay from "./OptionsOverlay.vue";
import OpenHotspot from "./OpenHotspot.vue";
import { storeToRefs } from "pinia";
import { useUpload } from "../../scripts/useUpload";
import { debounce } from "../../scripts/hhUtils";
import { useThrottleFn } from "@vueuse/core";
import { useModelViewer } from "../../scripts/useModelViewer";
import { useHotspots } from "../../scripts/useHotspots";
import { useThumbnail } from "../../scripts/useThumbnail";

const props = defineProps({
  modelId: { type: String, required: true },
  downloadable: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  fileRef: { type: File, required: false },
  captureRequest: { type: Boolean, default: false },
  deleteUnsaved: { type: Boolean, default: false },
  commitUnsaved: { type: Boolean, default: false },
});

const emit = defineEmits([
  "capture-complete",
  "unsaved-deleted",
  "unsaved-commited",
]);

// Visualizer configuration
const fov = ref("75");
const bgColor = ref<string>("white");
const light = ref("50");
const rotation = ref(true);
const speed = ref("50");

const values = {
  fov,
  bgColor,
  light,
  rotation,
  speed,
};

const container = useTemplateRef("container");

const {
  scene,
  camera,
  renderer,
  controls,
  modelMeshes,
  ambientLight,
  loading,
  loadingProgress,
  objectUrl,
  init,
  fetchAndLoadModel,
  handleResize,
  cleanup,
  modelScale,
} = useModelViewer(container);

const areHSVisible = ref(true);

const handleToolbarHSToggle = () => {
  areHSVisible.value = toggleHotspotMarkers(camera);
};

// Toolbar config
const {
  toggleFullscreen,
  downloadModel,
  updateFOV,
  setRotate,
  setRotationSpeed,
  setAmbientLight,
  setBackgroundColor,
} = useToolbar();
const fsContainer = useTemplateRef("fsContainer");
const downloadLink = useTemplateRef("downloadLink");
const isHelpOpen = ref(false);
const isOptionsOpen = ref(false);

watch(fov, (val) => {
  updateFOV(camera, val);
});

watch(rotation, (val) => {
  setRotate(controls.value, val);
});

watch(speed, (val) => {
  setRotationSpeed(controls.value, val);
});

watch(light, (val) => {
  setAmbientLight(ambientLight.value, val);
});

watch(bgColor, (val) => {
  setBackgroundColor(scene, val);
});

const toggleRotate = () => {
  rotation.value = !rotation.value;
};

// Visualizer overlays
const toggleHelpOverlay = () => {
  isHelpOpen.value = !isHelpOpen.value;
};

const toggleOptionsMenu = () => {
  isOptionsOpen.value = !isOptionsOpen.value;
};

// Hotspots
const hotspotStore = useHotspotStore();
const { isHotspotMode, requestedEdit, requestedDelete } =
  storeToRefs(hotspotStore);

const {
  hoveredMarker,
  loadExistingHotspots,
  newHotspotOnClick,
  moveCameraToHotspot,
  hightlightHotspotsOnHover,
  openHotspot,
  isHotspotOpen,
  selectedHotspotID,
  closeHotspot,
  editHotspot,
  isEditingHotspot,
  deleteHotspot,
  textureCleanup,
  toggleHotspotMarkers,
  deleteHotspot3DObject,
  saveHotspotData,
  unsavedMarker,
} = useHotspots(scene, modelScale);

watch(isHotspotMode, (newVal) => {
  if (newVal) {
    rotation.value = false;
  }
});

watch(requestedEdit, (newVal) => {
  if (newVal) {
    selectedHotspotID.value = newVal;
    editHotspot();
    requestedEdit.value = null;
  }
});

watch(requestedDelete, (newVal) => {
  if (newVal) {
    selectedHotspotID.value = newVal;
    deleteHotspot();
    renderer.value?.render(scene, camera);
    requestedDelete.value = null;
  }
});

// Thumbnail
const { thumbnail } = useUpload();
const { showFlash, handleThumbnailCapture, setInitialThumbnail } = useThumbnail(
  renderer,
  camera,
  scene,
  thumbnail,
);

// Editor interactions
watch(
  () => props.captureRequest,
  (newVal) => {
    if (newVal) {
      handleThumbnailCapture();
      emit("capture-complete");
    }
  },
);

watch(
  () => props.deleteUnsaved,
  (newVal) => {
    if (newVal && unsavedMarker.value) {
      deleteHotspot3DObject(unsavedMarker.value);
      unsavedMarker.value = null;
      isEditingHotspot.value = false;
      emit("unsaved-deleted");
    }
  },
);

watch(
  () => props.commitUnsaved,
  (newVal) => {
    if (newVal && unsavedMarker.value) {
      saveHotspotData();
      emit("unsaved-commited");
    }
  },
);

// User interaction
const handleModelClick = (event: MouseEvent) => {
  if (!controls.value || !renderer.value) return;

  if (hoveredMarker.value) {
    rotation.value = false;
    moveCameraToHotspot(
      hoveredMarker.value.position,
      hoveredMarker.value.normal,
      camera,
      controls.value,
    );
    isEditingHotspot.value = false;
    openHotspot(hoveredMarker.value.id);
    return;
  }

  newHotspotOnClick(
    event,
    renderer.value,
    camera,
    modelMeshes.value,
    controls.value,
  );

  if (hotspotStore.isHotspotMode) {
    isEditingHotspot.value = true;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!renderer.value || !camera || hotspotStore.sceneMarkers.length === 0)
    return;

  hightlightHotspotsOnHover(event, renderer.value, camera);
};

const debouncedResize = debounce(handleResize);
const throttledMouseMove = useThrottleFn(handleMouseMove, 20);

onMounted(async () => {
  const initialized = init();
  if (!initialized) return;

  await fetchAndLoadModel(props.modelId, props.editing, props.fileRef);

  loadExistingHotspots();

  if (props.editing) {
    await setInitialThumbnail();
  } else {
    await setInitialThumbnail(props.modelId);
  }

  window.addEventListener("resize", debouncedResize);
});

onBeforeUnmount(() => {
  hotspotStore.cleanHotspotState();
  hotspotStore.cleanMarkers(scene, modelScale);
  textureCleanup();
  cleanup();
  window.removeEventListener("resize", debouncedResize);
});
</script>
