import { defineStore } from "pinia";
import { ref } from "vue";
import { type Mesh, type Vector3, type Scene } from "three";

type Hotspot = {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  label: string;
  content: string;
};

type HotspotMarker = {
  id: number;
  marker: Mesh;
  position: Vector3;
  normal: Vector3;
};

export const useHotspotStore = defineStore("hotspots", () => {
  const hotspots = ref<Record<number, Hotspot>>({});
  const sceneMarkers = ref<HotspotMarker[]>([]);

  const isHotspotMode = ref(false);
  const newHotspotID = ref(1);
  const newPosition = ref<{ x: number; y: number; z: number } | null>(null);
  const newQuaternion = ref<{
    x: number;
    y: number;
    z: number;
    w: number;
  } | null>(null);
  const newLabel = ref("");
  const newContent = ref("");

  const newMarker = ref<Mesh | null>(null);
  const newNormal = ref<{ x: number; y: number; z: number } | null>(null);

  const setHotspotMode = (enabled: boolean) => {
    isHotspotMode.value = enabled;
  };

  const addHotspot = (
    label: string,
    content: string,
    position: { x: number; y: number; z: number },
    quaternion: { x: number; y: number; z: number; w: number },
  ) => {
    const newHotspot: Hotspot = {
      label,
      content,
      position,
      quaternion,
    };
    const id = newHotspotID.value;
    hotspots.value[id] = newHotspot;

    newHotspotID.value++;
    isHotspotMode.value = false;

    printHotspotState();
  };

  const addMarker = (
    id: number,
    marker: Mesh,
    position: Vector3,
    normal: Vector3,
  ) => {
    const newMarker: HotspotMarker = {
      id,
      marker,
      position,
      normal,
    };

    sceneMarkers.value.push(newMarker);
    printHotspotState();
  };

  const saveHotspotData = (id: number, label: string, content: string) => {
    if (!(id in hotspots.value)) return;

    hotspots.value[id].label = label;
    hotspots.value[id].content = content;
  };

  const getHotspot = (id: number): Hotspot => {
    return hotspots.value[id];
  };

  const updateHotspot = (id: number, update: Partial<Hotspot>) => {
    if (!(id in hotspots.value)) return;

    hotspots.value[id] = {
      ...hotspots.value[id],
      ...update,
    };
  };

  const deleteHotspot = (id: number, scene: Scene) => {
    if (!(id in hotspots.value)) return;

    delete hotspots.value[id];

    const marker = scene.getObjectByName(`HH_Hotspot_${id}`) as Mesh | null;

    if (marker) {
      scene.remove(marker);
      marker.geometry.dispose();

      const material = marker.material;
      if (Array.isArray(material)) {
        material.forEach((mat) => mat.dispose());
      } else {
        material.dispose();
      }
    } else {
      console.warn(`Marker with ID: ${id} not found in scene`);
    }

    const markerIndex = sceneMarkers.value.findIndex((m) => m.id === id);
    if (markerIndex === -1) return;
    sceneMarkers.value.splice(markerIndex, 1);

    printHotspotState();
  };

  const cleanMarkers = (scene: Scene) => {
    sceneMarkers.value.forEach(({ marker }) => {
      scene.remove(marker);
      marker.geometry.dispose();

      const material = marker.material;

      if (Array.isArray(material)) {
        material.forEach((mat) => mat.dispose());
      } else {
        material.dispose();
      }
    });

    sceneMarkers.value = [];
  };

  const printHotspotState = () => {
    console.log("==== HOTSPOTS ====");
    Object.entries(hotspots.value).forEach(([id, hotspot]) => {
      console.log(`ID: ${id}`);
      console.log(`  Label: ${hotspot.label}`);
      console.log(`  Content: ${hotspot.content}`);
      console.log(
        `  Position: (${hotspot.position.x.toFixed(2)}, ${hotspot.position.y.toFixed(2)}, ${hotspot.position.z.toFixed(2)})`,
      );
      console.log(
        `  Quaternion: (${hotspot.quaternion.x.toFixed(2)}, ${hotspot.quaternion.y.toFixed(2)}, ${hotspot.quaternion.z.toFixed(2)}, ${hotspot.quaternion.w.toFixed(2)})`,
      );
    });

    console.log("==== SCENE MARKERS ====");
    sceneMarkers.value.forEach((marker, index) => {
      console.log(`Marker ${index}`);
      console.log(`  Hotspot ID: ${marker.id}`);
      console.log(
        `  Position: (${marker.position.x.toFixed(2)}, ${marker.position.y.toFixed(2)}, ${marker.position.z.toFixed(2)})`,
      );
      console.log(
        `  Normal: (${marker.normal.x.toFixed(2)}, ${marker.normal.y.toFixed(2)}, ${marker.normal.z.toFixed(2)})`,
      );
      console.log(`  Mesh: ${marker.marker.name}`);
    });
  };

  return {
    hotspots,
    sceneMarkers,
    newHotspotID,
    newPosition,
    newQuaternion,
    newNormal,
    newLabel,
    newContent,
    newMarker,
    isHotspotMode,
    setHotspotMode,
    addHotspot,
    addMarker,
    saveHotspotData,
    getHotspot,
    updateHotspot,
    deleteHotspot,
    cleanMarkers,
    printHotspotState,
  };
});
