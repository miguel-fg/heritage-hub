import { defineStore } from "pinia";
import { ref } from "vue";
import { type Mesh } from "three";

type Hotspot = {
  id: number;
  x: number;
  y: number;
  z: number;
  label: string;
  content: string;
  marker: Mesh;
};

export const useHotspotStore = defineStore("hotspots", () => {
  const hotspots = ref<Hotspot[]>([]);
  const isHotspotMode = ref(false);
  const newHotspotID = ref(1);
  const newPosition = ref<{ x: number; y: number; z: number } | null>(null);
  const newLabel = ref("");
  const newContent = ref("");
  const newMarker = ref<Mesh | null>(null);

  const setHotspotMode = (enabled: boolean) => {
    isHotspotMode.value = enabled;
  };

  const addHotspot = (
    position: { x: number; y: number; z: number },
    label: string,
    content: string,
    marker: Mesh,
  ) => {
    const newHotspot: Hotspot = {
      id: newHotspotID.value,
      x: position.x,
      y: position.y,
      z: position.z,
      label,
      content,
      marker,
    };
    hotspots.value.push(newHotspot);
    newHotspotID.value++;

    isHotspotMode.value = false;
  };

  const removeHotspot = (index: number) => {
    hotspots.value.splice(index, 1);
  };

  return {
    hotspots,
    newHotspotID,
    newPosition,
    newLabel,
    newContent,
    newMarker,
    isHotspotMode,
    setHotspotMode,
    addHotspot,
    removeHotspot,
  };
});
