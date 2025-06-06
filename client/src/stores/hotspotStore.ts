import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { type Mesh, type Vector3, type Scene } from "three";
import { useHotspots } from "../scripts/useHotspots";
import {
  type Hotspot,
  type HotspotMarker,
  type ModelHotspot,
} from "../types/model";

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

  const newNormal = ref<{ x: number; y: number; z: number } | null>(null);

  const requestedEdit = ref<number | null>(null);
  const requestedDelete = ref<number | null>(null);

  const setHotspotMode = (enabled: boolean) => {
    isHotspotMode.value = enabled;
  };

  const addHotspot = (
    label: string,
    content: string,
    position: { x: number; y: number; z: number },
    normal: { x: number; y: number; z: number },
    quaternion: { x: number; y: number; z: number; w: number },
  ) => {
    const newHotspot: Hotspot = {
      label,
      content,
      position,
      normal,
      quaternion,
    };
    const id = newHotspotID.value;
    hotspots.value[id] = newHotspot;

    newHotspotID.value++;
    isHotspotMode.value = false;

    return id;
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
  };

  const saveHotspotData = (id: number, label: string, content: string) => {
    if (!(id in hotspots.value)) return;

    hotspots.value[id].label = label;
    hotspots.value[id].content = content;
  };

  const getHotspot = (id: number): Hotspot | undefined => {
    if (!(id in hotspots.value)) return;

    return hotspots.value[id];
  };

  const updateHotspot = (id: number, update: Partial<Hotspot>) => {
    if (!(id in hotspots.value)) return;

    hotspots.value[id] = {
      ...hotspots.value[id],
      ...update,
    };
  };

  const deleteHotspot = (id: number, scene: Scene, modelScale: Ref<number>) => {
    if (!(id in hotspots.value)) return;

    delete hotspots.value[id];

    const marker = scene.getObjectByName(`HH_Hotspot_${id}`) as Mesh | null;
    const { deleteHotspot3DObject } = useHotspots(scene, modelScale);

    if (marker) {
      deleteHotspot3DObject(marker);
    } else {
      console.warn(`Marker with ID: ${id} not found in scene`);
    }

    const markerIndex = sceneMarkers.value.findIndex((m) => m.id === id);
    if (markerIndex === -1) return;
    sceneMarkers.value.splice(markerIndex, 1);
  };

  /**
   * Set hotspot state from database array
   */
  const setHotspotState = (modelHotspots: ModelHotspot[]) => {
    hotspots.value = {};

    let newHotspot: Hotspot;

    modelHotspots.forEach((hs) => {
      newHotspot = {
        label: hs.label,
        content: hs.content,
        position: { x: hs.posX, y: hs.posY, z: hs.posZ },
        normal: { x: hs.norX, y: hs.norY, z: hs.norZ },
        quaternion: { x: hs.quatX, y: hs.quatY, z: hs.quatZ, w: hs.quatW },
      };

      hotspots.value[hs.id] = newHotspot;
    });
  };

  /**
   * Clean hotspot record
   */
  const cleanHotspotState = () => {
    hotspots.value = {};

    isHotspotMode.value = false;

    newHotspotID.value = 1;
    newPosition.value = null;
    newQuaternion.value = null;
    newNormal.value = null;

    newLabel.value = "";
    newContent.value = "";

    requestedEdit.value = null;
    requestedDelete.value = null;
  };

  /**
   * Remove markers from Three.js scene
   */
  const cleanMarkers = (scene: Scene, modelScale: Ref<number>) => {
    const { deleteHotspot3DObject } = useHotspots(scene, modelScale);
    sceneMarkers.value.forEach(({ marker }) => {
      deleteHotspot3DObject(marker);
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
    isHotspotMode,
    setHotspotMode,
    setHotspotState,
    cleanHotspotState,
    addHotspot,
    addMarker,
    saveHotspotData,
    getHotspot,
    updateHotspot,
    deleteHotspot,
    cleanMarkers,
    printHotspotState,
    requestedEdit,
    requestedDelete,
  };
});
