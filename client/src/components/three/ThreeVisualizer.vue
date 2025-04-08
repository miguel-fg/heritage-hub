<template>
  <div
    ref="fsContainer"
    class="relative flex w-full h-full rounded-sm bg-white overflow-hidden"
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
      state="visiting"
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
    <div
      ref="container"
      class="flex w-full h-full cursor-grab active:cursor-grabbing"
    ></div>
    <a ref="downloadLink" class="hidden"></a>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useTemplateRef, onMounted, onUnmounted, ref, watch } from "vue";
import { useModelStore } from "../../stores/modelStore";
import { useToolbar } from "../../scripts/threeUtils";
import Toolbar from "./Toolbar.vue";
import HelpOverlay from "./HelpOverlay.vue";
import OptionsOverlay from "./OptionsOverlay.vue";

const props = defineProps({
  modelId: { type: String, required: true },
  editing: { type: Boolean, default: false },
});

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

// Model 3D Object
const modelStore = useModelStore();
const loading = ref(false);
const loadingProgress = ref(0);
const objectUrl = ref("");
const model = ref<THREE.Group | null>(null);
const loader = new GLTFLoader();

// Animation loop
const animate = () => {
  if (renderer.value) {
    controls.value?.update();
    renderer.value.render(scene, camera);
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
      );

      loader.load(
        objectUrl.value,
        (gltf) => {
          model.value = gltf.scene;

          // Center model
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          // Adjust model position
          gltf.scene.position.x = -center.x;
          gltf.scene.position.y = -center.y;
          gltf.scene.position.z = -center.z;

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
          loading.value = false;
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

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (renderer.value) {
    renderer.value.setAnimationLoop(null);
    renderer.value.dispose();
  }
});
</script>
