<template>
  <div
    ref="container"
    class="flex w-full h-full rounded-sm overflow-hidden"
  ></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { useTemplateRef, onMounted, onUnmounted, ref } from "vue";

const container = useTemplateRef("container");
const renderer = ref<THREE.WebGLRenderer | null>(null);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const animate = () => {
  if (renderer.value) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.value.render(scene, camera);
  }
};

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

onMounted(() => {
  if (WebGL.isWebGL2Available()) {
    renderer.value = new THREE.WebGLRenderer({ antialias: true });
    renderer.value.setPixelRatio(window.devicePixelRatio);

    container.value?.appendChild(renderer.value.domElement);
    handleResize();

    window.addEventListener("resize", handleResize);

    renderer.value.setAnimationLoop(animate);
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
