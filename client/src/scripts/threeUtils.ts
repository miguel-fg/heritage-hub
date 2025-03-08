import type { Ref } from "vue";

export const useFullscreen = (containerRef: Ref<HTMLElement | null>) => {
  const toggleFullscreen = () => {
    if (!containerRef.value) return;

    // Enter fullscreen
    if (!document.fullscreenElement) {
      if (containerRef.value.requestFullscreen) {
        containerRef.value.requestFullscreen();
      } else if ((containerRef.value as any).webkitRequestFullscreen) {
        (containerRef.value as any).webkitRequestFullscreen(); // Safari support
      } else if ((containerRef.value as any).msRequestFullscreen) {
        (containerRef.value as any).msRequestFullscreen(); // IE/Edge support
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

  return { toggleFullscreen };
};
