import { ref, type Ref } from "vue";
import * as THREE from "three";

export const useThumbnail = (
  renderer: Ref<THREE.WebGLRenderer | null>,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  thumbnailRef: Ref<string | null>,
) => {
  const showFlash = ref(false);
  const captureReady = ref(false);

  /**
   * Manual thumbnail capture (adds flash effect for feedback)
   */
  const handleThumbnailCapture = () => {
    showFlash.value = true;
    setTimeout(() => {
      showFlash.value = false;
    }, 150);

    captureThumbnail();
  };

  /**
   * Capture current renderer view as a thumbnail
   */
  const captureThumbnail = () => {
    if (!captureReady.value || !renderer.value) return;

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
    thumbnailRef.value = squareDataUrl;

    camera.layers.enableAll();
  };

  const setInitialThumbnail = () => {
    captureReady.value = true;
    captureThumbnail();
  };

  return {
    showFlash,
    handleThumbnailCapture,
    captureThumbnail,
    setInitialThumbnail,
  };
};
