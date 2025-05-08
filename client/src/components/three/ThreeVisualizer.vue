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
      @fullscreen="toggleFullscreen(fsContainer)"
      @download="downloadModel(downloadLink, objectUrl)"
      @options="toggleOptionsMenu"
      @help="toggleHelpOverlay"
    />
    <HelpOverlay
      v-if="isHelpOpen"
      @click="toggleHelpOverlay"
      state="visiting"
    />
    <OptionsOverlay v-if="isOptionsOpen" state="visiting" :values="values" />
    <HotspotOverlay
      v-if="isEditingHotspot"
      :editing-hotspot-id="editingHotspotID"
      @save="saveHotspotData"
      @update="saveHotspotData(editingHotspotID)"
      @cancel="() => (isEditingHotspot = false)"
    />
    <OpenHotspot
      v-if="isHotspotOpen && selectedHotspotID"
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
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CENTER, MeshBVH, acceleratedRaycast } from "three-mesh-bvh";
import { useTemplateRef, onMounted, onUnmounted, ref, watch } from "vue";
import { useModelStore } from "../../stores/modelStore";
import { useHotspotStore } from "../../stores/hotspotStore";
import { useToolbar } from "../../scripts/useToolbar";
import Toolbar from "./Toolbar.vue";
import HelpOverlay from "./HelpOverlay.vue";
import OptionsOverlay from "./OptionsOverlay.vue";
import gsap from "gsap";
import HotspotOverlay from "./HotspotOverlay.vue";
import OpenHotspot from "./OpenHotspot.vue";
import { storeToRefs } from "pinia";
import { useToastStore } from "../../stores/toastStore";
import { useUpload } from "../../scripts/useUpload";
import { debounce } from "../../scripts/hhUtils";
import { useThrottleFn } from "@vueuse/core";

THREE.Mesh.prototype.raycast = acceleratedRaycast;

const props = defineProps({
  modelId: { type: String, required: true },
  editing: { type: Boolean, default: false },
  fileRef: { type: File, required: false },
  captureRequest: { type: Boolean, default: false },
});

const emit = defineEmits(["capture-complete"]);

const toastStore = useToastStore();

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
const renderer = ref<THREE.WebGLRenderer | null>(null);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(parseInt(fov.value), 1, 0.1, 1000);
camera.position.z = 5;
camera.layers.enableAll();

const controls = ref<OrbitControls | null>(null);
const ambientLight = ref<THREE.AmbientLight>(
  new THREE.AmbientLight(0xffffff, parseInt(light.value) / 100),
);
scene.add(ambientLight.value);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

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

// Hotspots
const hotspotStore = useHotspotStore();
const selectedHotspotID = ref<number | null>(null);
const editingHotspotID = ref<number | null>(null);
const isHotspotOpen = ref(false);

const hotspotGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.005, 32);
const hotspotMaterial = new THREE.MeshBasicMaterial({
  color: 0x0d0d0d,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
  depthTest: true,
  depthWrite: false,
});
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const vector3 = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const normalMatrix = new THREE.Matrix3();

type HotspotMarker = {
  id: number;
  marker: THREE.Mesh;
  position: THREE.Vector3;
  normal: THREE.Vector3;
};

type Hotspot = {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  label: string;
  content: string;
};

const {
  isHotspotMode,
  newHotspotID,
  newPosition,
  newQuaternion,
  newLabel,
  newContent,
  requestedEdit,
  requestedDelete,
} = storeToRefs(hotspotStore);
const isEditingHotspot = ref(false);

watch(isHotspotMode, (newVal) => {
  if (newVal) {
    rotation.value = false;
  }
});

watch(requestedEdit, (newVal) => {
  if (newVal) {
    selectedHotspotID.value = newVal;
    editHotspot();
  }
});

watch(requestedDelete, (newVal) => {
  if (newVal) {
    selectedHotspotID.value = newVal;
    deleteHotspot();
  }
});

const handleModelClick = (event: MouseEvent) => {
  if (hoveredMarker.value) {
    rotation.value = false;
    moveCameraToHotspot(
      hoveredMarker.value.position,
      hoveredMarker.value.normal,
      false,
    );
    openHotspot(hoveredMarker.value.id);
    return;
  }

  newHotspotOnClick(event);
};

const newHotspotOnClick = (event: MouseEvent) => {
  if (!hotspotStore.isHotspotMode || !renderer.value || !model.value) return;

  const rect = renderer.value.domElement.getBoundingClientRect();
  mouse.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  raycaster.layers.enableAll();
  raycaster.near = camera.near;
  raycaster.far = camera.far;
  raycaster.firstHitOnly = true;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(modelMeshes.value, false);
  if (intersects.length > 0) {
    const { point, face, object } = intersects[0];

    normalMatrix.getNormalMatrix(object.matrixWorld);
    const worldNormal = face!.normal
      .clone()
      .applyMatrix3(normalMatrix)
      .normalize();
    const offsetPoint = point.clone().add(worldNormal!.multiplyScalar(0.01));

    addHotspotMarker(offsetPoint, worldNormal);
    moveCameraToHotspot(offsetPoint, worldNormal, true);
  }
};

const addHotspotMarker = (position: THREE.Vector3, normal: THREE.Vector3) => {
  const marker = new THREE.Mesh(hotspotGeometry, hotspotMaterial);

  marker.rotation.x = Math.PI / 2;

  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal.clone().normalize(),
  );
  marker.quaternion.premultiply(quaternion);
  marker.position.copy(position);

  const markerId = newHotspotID.value;
  marker.name = `HH_Hotspot_${markerId}`;
  marker.layers.set(1);
  scene.add(marker);
  hotspotStore.addMarker(markerId, marker, position.clone(), normal.clone());

  newPosition.value = marker.position;
  newQuaternion.value = marker.quaternion;
};

const createMarker = (id: number, hotspot: Hotspot) => {
  const marker = new THREE.Mesh(hotspotGeometry, hotspotMaterial);

  marker.rotation.x = Math.PI / 2;

  marker.quaternion.set(
    hotspot.quaternion.x,
    hotspot.quaternion.y,
    hotspot.quaternion.z,
    hotspot.quaternion.w,
  );

  marker.position.set(
    hotspot.position.x,
    hotspot.position.y,
    hotspot.position.z,
  );

  const baseNormal = new THREE.Vector3(0, 0, 1);
  vector3.copy(baseNormal).applyQuaternion(marker.quaternion);

  marker.layers.set(1);
  marker.name = `HH_Hotspot_${id}`;
  scene.add(marker);

  hotspotStore.addMarker(id, marker, marker.position.clone(), vector3.clone());
};

const hoveredMarker = ref<HotspotMarker | null>(null);

const handleMouseMove = (event: MouseEvent) => {
  if (!renderer.value || !camera || hotspotStore.sceneMarkers.length === 0)
    return;

  const rect = renderer.value.domElement.getBoundingClientRect();
  mouse.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  raycaster.layers.set(1);
  raycaster.setFromCamera(mouse, camera);

  const markerMeshes = hotspotStore.sceneMarkers.map((m) => m.marker);

  const intersects = raycaster.intersectObjects(markerMeshes, false);

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    const found = hotspotStore.sceneMarkers.find(
      (m) => m.marker === intersected,
    );

    if (found) {
      hoveredMarker.value = found;
      (found.marker.material as THREE.MeshBasicMaterial).color.set(0x801323);
    }
  } else {
    if (hoveredMarker.value) {
      (
        hoveredMarker.value.marker.material as THREE.MeshBasicMaterial
      ).color.set(0x0d0d0d);
      hoveredMarker.value = null;
    }
  }
};

const throttledMouseMove = useThrottleFn(handleMouseMove, 20);

const moveCameraToHotspot = (
  targetPosition: THREE.Vector3,
  normal: THREE.Vector3,
  isEditing: boolean,
) => {
  if (!controls.value) return;

  const distance = 35;

  controls.value.enabled = false;

  const newCameraPosition = targetPosition
    .clone()
    .add(normal.clone().multiplyScalar(distance));

  gsap.to(camera.position, {
    x: newCameraPosition.x,
    y: newCameraPosition.y,
    z: newCameraPosition.z,
    duration: 1.2,
    ease: "power2.out",
    onUpdate: () => {
      camera.lookAt(targetPosition);
      controls.value!.target.copy(targetPosition);
      controls.value!.update();
    },
    onComplete: () => {
      controls.value!.enabled = true;

      if (isEditing) {
        isEditingHotspot.value = true;
      }
    },
  });
};

const openHotspot = (hotspotID: number) => {
  const hotspot = hotspotStore.hotspots[hotspotID];

  if (!hotspot) {
    toastStore.showToast("error", "Could not find hotspot information");
    return;
  }

  selectedHotspotID.value = hotspotID;
  isHotspotOpen.value = true;
};

const closeHotspot = () => {
  selectedHotspotID.value = null;
  isHotspotOpen.value = false;
};

const editHotspot = () => {
  if (!selectedHotspotID.value) {
    toastStore.showToast("error", "Could not find hotspot");
    console.error("Hotspot ID not found");
    return;
  }

  editingHotspotID.value = selectedHotspotID.value;

  closeHotspot();
  isEditingHotspot.value = true;
};

const deleteHotspot = () => {
  if (!selectedHotspotID.value) {
    toastStore.showToast("error", "Could not delete hotspot");
    console.error("Hotspot ID not found.");
    return;
  }

  const id = selectedHotspotID.value;

  closeHotspot();

  hotspotStore.deleteHotspot(id, scene);
  renderer.value?.render(scene, camera);
};

const saveHotspotData = (id: number | null = null) => {
  if (!id) {
    // New hotspot
    if (
      !newPosition.value ||
      !newQuaternion.value ||
      newLabel.value === "" ||
      newContent.value === ""
    ) {
      toastStore.showToast("error", "Invalid hotspot data!");
      return;
    }

    hotspotStore.addHotspot(
      newLabel.value,
      newContent.value,
      newPosition.value,
      newQuaternion.value,
    );
    hotspotStore.setHotspotMode(false);
  } else {
    // Update hotspot
    if (!(id in hotspotStore.hotspots)) {
      toastStore.showToast("error", "Could not update hotspot");
      console.error("Hotspot ID not found");
      return;
    }

    if (newLabel.value === "" || newContent.value === "") {
      toastStore.showToast("error", "Invalid hotspot data");
      return;
    }

    hotspotStore.saveHotspotData(id, newLabel.value, newContent.value);
  }
  isEditingHotspot.value = false;
  toastStore.showToast("success", "Hotspot saved!");
};

// Thumbnail
const { thumbnail } = useUpload();
const snap = ref(true);
const showFlash = ref(false);

const handleThumbnailCapture = () => {
  snap.value = true;

  showFlash.value = true;
  setTimeout(() => {
    showFlash.value = false;
  }, 150);
};

const captureThumbnail = () => {
  if (!renderer.value || !camera) return;

  camera.layers.disable(1);
  renderer.value.render(scene, camera);

  const canvas = renderer.value.domElement;
  const width = canvas.width;
  const height = canvas.height;
  const squareSize = Math.min(width, height);

  const cropX = (width - squareSize) / 2;
  const cropY = (height - squareSize) / 2;

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = squareSize;
  croppedCanvas.height = squareSize;
  const ctx = croppedCanvas.getContext("2d");

  if (!ctx) return;

  ctx.drawImage(
    canvas,
    cropX,
    cropY,
    squareSize,
    squareSize,
    0,
    0,
    squareSize,
    squareSize,
  );
  const squareDataUrl = croppedCanvas.toDataURL("image/png");

  thumbnail.value = squareDataUrl;

  camera.layers.enableAll();
};

watch(
  () => props.captureRequest,
  (newVal) => {
    if (newVal) {
      handleThumbnailCapture();
      emit("capture-complete");
    }
  },
);

// Model 3D Object
const modelStore = useModelStore();
const loading = ref(false);
const loadingProgress = ref(0);
const objectUrl = ref("");
const model = ref<THREE.Group | null>(null);
const modelMeshes = ref<THREE.Mesh[]>([]);
const loader = new GLTFLoader();

// Animation loop
const animate = () => {
  if (renderer.value) {
    controls.value?.update();
    renderer.value.render(scene, camera);

    if (snap.value && model.value) {
      captureThumbnail();
      snap.value = false;
    }
  }
};

// Responsive scene dimensions
const handleResize = () => {
  if (!container.value || !renderer.value) {
    return;
  }

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.value.setSize(width, height);
};

const debouncedResize = debounce(handleResize);

const toggleHelpOverlay = () => {
  isHelpOpen.value = !isHelpOpen.value;
};

const toggleOptionsMenu = () => {
  isOptionsOpen.value = !isOptionsOpen.value;
};

onMounted(async () => {
  if (renderer.value) {
    renderer.value.dispose();
    renderer.value.forceContextLoss();
    renderer.value.domElement.remove();
  }

  if (WebGL.isWebGL2Available()) {
    // Initialize renderer
    renderer.value = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    renderer.value.shadowMap.enabled = true;
    container.value?.appendChild(renderer.value.domElement);
    handleResize();

    renderer.value.setAnimationLoop(animate);
    controls.value = new OrbitControls(camera, renderer.value.domElement);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.1;
    controls.value.autoRotate = rotation.value;
    controls.value.autoRotateSpeed = parseInt(speed.value) / 25;

    // Load model
    loading.value = true;
    try {
      objectUrl.value = await modelStore.getObjectUrl(
        props.modelId,
        props.editing,
        props.fileRef,
      );

      hotspotStore.cleanMarkers(scene);

      loader.load(
        objectUrl.value,
        (gltf) => {
          model.value = gltf.scene;

          // Build BVH for meshes in model
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              modelMeshes.value.push(child);
              const geometry = child.geometry;

              const bvh = new MeshBVH(geometry, {
                maxLeafTris: 10,
                strategy: CENTER,
              });

              geometry.boundsTree = bvh;
            }
          });

          // Center model
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          // Adjust model position
          gltf.scene.position.x -= center.x;
          gltf.scene.position.y -= center.y;
          gltf.scene.position.z -= center.z;

          // Adjust camera to fit model
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ *= 1.5; // Padding
          camera.position.z = cameraZ;

          // Update camera's near and far planes
          camera.near = cameraZ / 100;
          camera.far = cameraZ * 100;
          camera.updateProjectionMatrix();

          if (controls.value) {
            controls.value.update();
          }

          scene.add(gltf.scene);

          Object.entries(hotspotStore.hotspots).forEach(([id, hotspot]) => {
            createMarker(Number(id), hotspot);
          });
          loading.value = false;
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            loadingProgress.value = Math.round((xhr.loaded / xhr.total) * 100);
          }
        },
        (error) => {
          console.error("Error loading model: ", error);
        },
      );
    } catch (error) {
      console.error("Error fetching model URL: ", error);
      loading.value = false;
    }

    window.addEventListener("resize", debouncedResize);
  } else {
    const warning = WebGL.getWebGL2ErrorMessage();
    container.value?.appendChild(warning);
  }
});

// Cleanup
onUnmounted(() => {
  window.removeEventListener("resize", debouncedResize);
  if (renderer.value) {
    renderer.value.setAnimationLoop(null);
  }

  if (hotspotGeometry) hotspotGeometry.dispose();
  if (hotspotMaterial) hotspotMaterial.dispose();

  modelMeshes.value.forEach((mesh) => {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => disposeThreeMaterial(material));
    } else {
      disposeThreeMaterial(mesh.material);
    }
  });

  modelMeshes.value = [];

  if (model.value) {
    scene.remove(model.value);
    model.value = null;
  }

  if (controls.value) {
    controls.value.dispose();
    controls.value = null;
  }

  scene.remove(ambientLight.value);
  scene.remove(directionalLight);

  while (scene.children.length > 0) {
    const object = scene.children[0];
    scene.remove(object);
  }

  if (renderer.value) {
    const domElement = renderer.value.domElement;
    if (domElement && domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
    }
    renderer.value.dispose();
    renderer.value.forceContextLoss();
    renderer.value.domElement.remove();
    renderer.value = null;
  }
});

const disposeThreeMaterial = (material: THREE.Material) => {
  material.dispose();
};
</script>
