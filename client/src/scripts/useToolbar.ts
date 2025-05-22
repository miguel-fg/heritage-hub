import {
  Color,
  type AmbientLight,
  type PerspectiveCamera,
  type Scene,
} from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const useToolbar = () => {
  // Fullscreen
  const toggleFullscreen = (container: HTMLElement | null) => {
    if (!container) return;

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

  const updateFOV = (camera: PerspectiveCamera, fov: string) => {
    camera.fov = parseInt(fov);
    camera.updateProjectionMatrix();
  };

  const setRotate = (controls: OrbitControls | null, enabled: boolean) => {
    if (!controls) return;

    controls.autoRotate = enabled;
    controls.update();
  };

  const setRotationSpeed = (controls: OrbitControls | null, speed: string) => {
    if (!controls) return;

    controls.autoRotateSpeed = parseInt(speed) / 25;
    controls.update();
  };

  const setAmbientLight = (light: AmbientLight, intensity: string) => {
    light.intensity = parseInt(intensity) / 100;
  };

  const setBackgroundColor = (scene: Scene, color: string) => {
    switch (color) {
      case "white":
        scene.background = new Color(0xffffff);
        break;
      case "gray":
        scene.background = new Color(0x817e7f);
        break;
      case "black":
        scene.background = new Color(0x0d0d0d);
        break;
    }
  };

  return {
    toggleFullscreen,
    downloadModel,
    updateFOV,
    setRotate,
    setRotationSpeed,
    setAmbientLight,
    setBackgroundColor,
  };
};
