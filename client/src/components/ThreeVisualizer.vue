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
    <Toolbar state="visiting" @fullscreen="toggleFullscreen" />
    <div
      ref="container"
      class="flex w-full h-full cursor-grab active:cursor-grabbing"
    ></div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useTemplateRef, onMounted, onUnmounted, ref } from "vue";
import { useModelStore } from "../stores/modelStore";
import { useFullscreen } from "../scripts/threeUtils";
import Toolbar from "./Toolbar.vue";

const props = defineProps({
  modelId: { type: String, required: true },
});

// Visualizer configuration
const container = useTemplateRef("container");
const fsContainer = useTemplateRef("fsContainer");
const renderer = ref<THREE.WebGLRenderer | null>(null);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5;

const controls = ref<OrbitControls | null>(null);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const { toggleFullscreen } = useFullscreen(fsContainer);

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

onMounted(async () => {
  if (WebGL.isWebGL2Available()) {
    // Initialize renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true });
    renderer.value.setPixelRatio(window.devicePixelRatio);
    container.value?.appendChild(renderer.value.domElement);
    handleResize();

    renderer.value.setAnimationLoop(animate);
    controls.value = new OrbitControls(camera, renderer.value.domElement);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.1;
    controls.value.autoRotate = true;

    // Load model
    loading.value = true;
    try {
      objectUrl.value = await modelStore.getObjectUrl(props.modelId);

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
