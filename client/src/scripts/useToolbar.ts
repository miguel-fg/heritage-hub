import {
  Color,
  type AmbientLight,
  type PerspectiveCamera,
  type Scene,
} from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useToastStore } from "../stores/toastStore";
import { isIOS } from "@vueuse/core";
import { onUnmounted, ref } from "vue";

const whiteBg = new Color(0xffffff);
const grayBg = new Color(0x817e7f);
const blackBg =  new Color(0x0d0d0d);
const selectedBgColor = ref<"white" | "gray" | "black">("white");

export const useToolbar = () => {

  // Fullscreen
  const toggleFullscreen = (container: HTMLElement | null) => {
    const toastStore = useToastStore();
    if (!container) return;

    if (isIOS) {
      toastStore.showToast("error", "Fullscreen not supported in iOS");
      return;
    }

    // Enter fullscreen
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen(); // Safari support
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen(); // IE/Edge support
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen(); // Safari support
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen(); // IE/Edge support
      }
    }
  };

  // Options
  const downloadModel = (link: HTMLAnchorElement | null, modelUrl: string) => {
    if (!link || !modelUrl) return;

    link.href = modelUrl;
    link.click();
  };

  const updateFOV = (camera: PerspectiveCamera, fov: number) => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  };

  const setRotate = (controls: OrbitControls | null, enabled: boolean) => {
    if (!controls) return;

    controls.autoRotate = enabled;
    controls.update();
  };

  const setRotationSpeed = (controls: OrbitControls | null, speed: number) => {
    if (!controls) return;

    controls.autoRotateSpeed = speed / 25;
    controls.update();
  };

  const setAmbientLight = (light: AmbientLight, intensity: number) => {
    light.intensity = intensity / 100;
  };

  const setBackgroundColor = (scene: Scene, color: string) => {
    switch (color) {
      case "white":
        scene.background = whiteBg;
        selectedBgColor.value = color;
        break;
      case "gray":
        scene.background = grayBg;
        selectedBgColor.value = color;
        break;
      case "black":
        scene.background = blackBg;
        selectedBgColor.value = color;
        break;
    }
  };

  onUnmounted(() => selectedBgColor.value = "white");

  return {
    toggleFullscreen,
    downloadModel,
    updateFOV,
    setRotate,
    setRotationSpeed,
    setAmbientLight,
    selectedBgColor,
    setBackgroundColor,
  };
};
