export const useToolbar = () => {
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

  const downloadModel = (link: HTMLAnchorElement | null, modelUrl: string) => {
    if (!link || !modelUrl) return;

    link.href = modelUrl;
    link.click();
  };

  return { toggleFullscreen, downloadModel };
};
