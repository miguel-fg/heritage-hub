<template>
  <div
    ref="fsContainer"
    class="relative flex w-full h-full rounded-sm bg-white overflow-hidden shadow-sm"
  >
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
    <Toolbar
      :editing="props.editing"
      @fullscreen="toggleFullscreen(fsContainer)"
      @download="downloadModel(downloadLink, objectUrl)"
      @options="toggleOptionsMenu"
      @help="toggleHelpOverlay"
      @hotspots="handleHotspotToggle"
      @thumbnail="() => (snap = true)"
    />
    <HelpOverlay
      v-if="isHelpOpen"
      @click="toggleHelpOverlay"
      state="visiting"
    />
    <OptionsOverlay v-if="isOptionsOpen" state="visiting" :values="values" />
    <HotspotOverlay
      v-if="isEditingHotspot"
      @save="saveHotspotData"
      @cancel="() => (isEditingHotspot = false)"
    />
    <div
      ref="container"
      class="flex w-full h-full"
      @click="handleModelClick"
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
import { storeToRefs } from "pinia";
import { useToastStore } from "../../stores/toastStore";
import { useUpload } from "../../scripts/useUpload";

THREE.Mesh.prototype.raycast = acceleratedRaycast;

const props = defineProps({
  modelId: { type: String, required: true },
  editing: { type: Boolean, default: false },
  fileRef: { type: File, required: false },
});

const toastStore = useToastStore();

// Visualizer configuration
const fov = ref("75");
const bgColor = ref<string>("white");
const light = ref("50");
const rotation = ref(true);
const wasRotating = ref(true);
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
  wasRotating.value = val;
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

// Hotspot store
const hotspotStore = useHotspotStore();
const { newPosition, newMarker, newLabel, newContent } =
  storeToRefs(hotspotStore);
const isEditingHotspot = ref(false);

const handleHotspotToggle = () => {
  if (!controls.value) return;

  if (hotspotStore.isHotspotMode) {
    hotspotStore.setHotspotMode(false);
    if (wasRotating.value) {
      setRotate(controls.value, true);
    }
  } else {
    hotspotStore.setHotspotMode(true);
    setRotate(controls.value, false);
  }
};

const handleModelClick = (event: MouseEvent) => {
  if (!hotspotStore.isHotspotMode || !renderer.value || !model.value) return;

  const rect = renderer.value.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  const raycaster = new THREE.Raycaster();
  raycaster.near = camera.near;
  raycaster.far = camera.far;
  raycaster.firstHitOnly = true;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(modelMeshes.value, false);
  if (intersects.length > 0) {
    const { point, face, object } = intersects[0];

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(
      object.matrixWorld,
    );
    const worldNormal = face!.normal
      .clone()
      .applyMatrix3(normalMatrix)
      .normalize();
    const offsetPoint = point.clone().add(worldNormal!.multiplyScalar(0.01));

    addHotspotMarker(offsetPoint, worldNormal);
    moveCameraToHotspot(offsetPoint, worldNormal);
  }
};

const addHotspotMarker = (position: THREE.Vector3, normal: THREE.Vector3) => {
  const radius = 0.025;
  const height = 0.005;

  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);

  const material = new THREE.MeshBasicMaterial({
    color: 0x0d0d0d,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
  });
  const marker = new THREE.Mesh(geometry, material);

  marker.rotation.x = Math.PI / 2;

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal.clone().normalize(),
  );
  marker.quaternion.premultiply(quat);
  marker.position.copy(position);

  scene.add(marker);
  newPosition.value = marker.position;
  newMarker.value = marker;
};

const moveCameraToHotspot = (
  targetPosition: THREE.Vector3,
  normal: THREE.Vector3,
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
      isEditingHotspot.value = true;
    },
  });
};

const saveHotspotData = () => {
  if (
    !newPosition.value ||
    newLabel.value === "" ||
    newContent.value === "" ||
    !newMarker.value
  ) {
    toastStore.showToast("error", "Invalid hotspot data!");
    return;
  }

  hotspotStore.addHotspot(
    newPosition.value,
    newLabel.value,
    newContent.value,
    newMarker.value,
  );
  printHotspotState();
  isEditingHotspot.value = false;
  toastStore.showToast("success", "Hotspot saved!");
};

const printHotspotState = () => {
  console.log("==== HOTSPOT STATE ====");
  console.log(hotspotStore.hotspots);
};

// Thumbnail
const { thumbnail } = useUpload();
let snap = true;

const captureThumbnail = () => {
  if (!renderer.value) return;

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
};

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

    if (snap && model.value) {
      captureThumbnail();
      snap = false;
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

const toggleHelpOverlay = () => {
  isHelpOpen.value = !isHelpOpen.value;
};

const toggleOptionsMenu = () => {
  isOptionsOpen.value = !isOptionsOpen.value;
};

onMounted(async () => {
  if (WebGL.isWebGL2Available()) {
    // Initialize renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true });
    renderer.value.setPixelRatio(window.devicePixelRatio);
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
    window.addEventListener("resize", handleResize);
  } else {
    const warning = WebGL.getWebGL2ErrorMessage();
    container.value?.appendChild(warning);
  }
});

// Cleanup
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (renderer.value) {
    renderer.value.setAnimationLoop(null);
  }

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
    renderer.value = null;
  }
});

const disposeThreeMaterial = (material: THREE.Material) => {
  material.dispose();
};
</script>
