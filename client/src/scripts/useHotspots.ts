import * as THREE from "three";
import gsap from "gsap";
import { acceleratedRaycast } from "three-mesh-bvh";
import { useHotspotStore } from "../stores/hotspotStore";
import { storeToRefs } from "pinia";
import { type Hotspot, type HotspotMarker } from "../types/model.ts";
import { useToastStore } from "../stores/toastStore.ts";
import { ref, type Ref } from "vue";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

THREE.Mesh.prototype.raycast = acceleratedRaycast;

const textureLoader = new THREE.TextureLoader();
const defaultIconTexture = textureLoader.load("/textures/default-icon.png");
const highlightIconTexture = textureLoader.load("/textures/highlight-icon.png");

const hotspotGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.005, 32);
const hotspotMaterial = new THREE.MeshBasicMaterial({
  map: defaultIconTexture,
  transparent: true,
  opacity: 0.7,
  side: THREE.FrontSide,
  depthTest: true,
  depthWrite: false,
});
const highlightMaterial = new THREE.MeshBasicMaterial({
  map: highlightIconTexture,
  transparent: true,
  opacity: 0.7,
  side: THREE.FrontSide,
  depthTest: true,
  depthWrite: false,
});

const quaternion = new THREE.Quaternion();
const vector3 = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const unsavedMarker = ref<THREE.Mesh | null>(null);

export const useHotspots = (scene: THREE.Scene, modelScale: Ref<number>) => {
  const toastStore = useToastStore();
  const hotspotStore = useHotspotStore();
  const {
    newHotspotID,
    newPosition,
    newNormal,
    newQuaternion,
    newLabel,
    newContent,
    isHotspotMode,
  } = storeToRefs(hotspotStore);

  const selectedHotspotID = ref<number | null>(null);
  const editingHotspotID = ref<number | null>(null);
  const isHotspotOpen = ref(false);
  const isEditingHotspot = ref(false);
  const hoveredMarker = ref<HotspotMarker | null>(null);

  /**
   * Create a new Hotspot Record and Three.js marker based on mouse click
   */
  const addHotspotMarker = (position: THREE.Vector3, normal: THREE.Vector3) => {
    const id = newHotspotID.value;

    const marker = create3DHotspotObject(id);

    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal.clone().normalize(),
    );
    marker.quaternion.premultiply(quaternion);
    marker.position.copy(position);

    scene.add(marker);
    unsavedMarker.value = marker;

    newPosition.value = marker.position;
    newQuaternion.value = marker.quaternion;
    newNormal.value = normal.clone();
  };

  /**
   * Create a Three.js marker based on an existing Hotspot Record
   */
  const createMarker = (id: number, hotspot: Hotspot) => {
    const marker = create3DHotspotObject(id);

    marker.quaternion.set(
      hotspot.quaternion.x,
      hotspot.quaternion.y,
      hotspot.quaternion.z,
      hotspot.quaternion.w,
    );

    marker.position.set(
      hotspot.position.x,
      hotspot.position.y,
      hotspot.position.z,
    );

    const normal = vector3.set(
      hotspot.normal.x,
      hotspot.normal.y,
      hotspot.normal.z,
    );

    scene.add(marker);

    hotspotStore.addMarker(id, marker, marker.position.clone(), normal.clone());
  };

  /**
   * Create Three.js hotspot marker object
   */
  const create3DHotspotObject = (id: number): THREE.Mesh => {
    const marker = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
    marker.name = `HH_Hotspot_${id}`;
    marker.layers.set(1);

    marker.rotation.x = Math.PI / 2;
    marker.rotation.y = Math.PI / 2;

    marker.scale.setScalar(modelScale.value);

    return marker;
  };

  /**
   * Recreate all markers based on existing hotspot data
   */
  const loadExistingHotspots = () => {
    Object.entries(hotspotStore.hotspots).forEach(([id, h]) => {
      createMarker(Number(id), h);
    });
  };

  /**
   * Handle new hotspot creation on click
   */
  const newHotspotOnClick = (
    event: MouseEvent,
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
    modelMeshes: THREE.Object3D[],
    controls: OrbitControls,
  ) => {
    if (!isHotspotMode.value || !renderer || modelMeshes.length === 0) return;

    normalizeMouse(mouse, event.clientX, event.clientY, renderer);

    raycaster.layers.set(0);
    raycaster.near = camera.near;
    raycaster.far = camera.far;
    raycaster.firstHitOnly = true;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(modelMeshes, false);

    if (intersects.length > 0) {
      const { point, face, object } = intersects[0];

      normalMatrix.getNormalMatrix(object.matrixWorld);
      const worldNormal = face!.normal
        .clone()
        .applyMatrix3(normalMatrix)
        .normalize();
      const offsetPoint = point
        .clone()
        .add(worldNormal!.multiplyScalar(0.01 * modelScale.value));

      addHotspotMarker(offsetPoint, worldNormal);
      moveCameraToHotspot(offsetPoint, worldNormal, camera, controls);
    }
  };

  /**
   * Camera animation to focus on hotspot marker
   */
  const moveCameraToHotspot = (
    targetPosition: THREE.Vector3,
    normal: THREE.Vector3,
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
  ) => {
    const distance = 35;
    controls.enabled = false;

    const newCameraPosition = targetPosition
      .clone()
      .add(normal.clone().add(normal.clone().multiplyScalar(distance)));

    gsap.to(camera.position, {
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        camera.lookAt(targetPosition);
        controls.target.copy(targetPosition);
        controls.update();
      },
      onComplete: () => {
        controls.enabled = true;
      },
    });
  };

  /**
   * Change hovered hotspot color to signal interactivity
   */
  const hightlightHotspotsOnHover = (
    event: MouseEvent,
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
  ) => {
    normalizeMouse(mouse, event.clientX, event.clientY, renderer);

    raycaster.layers.set(1);
    raycaster.setFromCamera(mouse, camera);

    const markerMeshes = hotspotStore.sceneMarkers.map((m) => m.marker);

    const intersects = raycaster.intersectObjects(markerMeshes, true);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      const found = hotspotStore.sceneMarkers.find(
        (m) => m.marker === intersected,
      );

      if (found && found.marker.material !== highlightMaterial) {
        if (hoveredMarker.value && hoveredMarker.value !== found) {
          hoveredMarker.value.marker.material = hotspotMaterial;
        }

        hoveredMarker.value = found;
        found.marker.material = highlightMaterial;
      }
    } else {
      if (hoveredMarker.value) {
        hoveredMarker.value.marker.material = hotspotMaterial;
        hoveredMarker.value = null;
      }
    }
  };

  /**
   * Toggles camera membership to layer that contains the hotspot markers.
   */
  const toggleHotspotMarkers = (camera: THREE.PerspectiveCamera) => {
    if (camera.layers.isEnabled(1)) {
      camera.layers.disable(1);
    } else {
      camera.layers.enable(1);
    }

    return camera.layers.isEnabled(1);
  };

  /**
   * Normalize mouse coordinates on the Three.js renderer
   */
  const normalizeMouse = (
    mouse: THREE.Vector2,
    clientX: number,
    clientY: number,
    renderer: THREE.WebGLRenderer,
  ) => {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
  };

  /**
   * Open a hotspot on the renderer
   */
  const openHotspot = (hotspotID: number) => {
    const hotspot = hotspotStore.getHotspot(hotspotID);

    if (!hotspot) {
      toastStore.showToast("error", "Could not find hotspot information");
      return;
    }

    selectedHotspotID.value = hotspotID;
    isHotspotOpen.value = true;
  };

  /**
   * Close an open hotspot
   */
  const closeHotspot = () => {
    selectedHotspotID.value = null;
    isHotspotOpen.value = false;
  };

  /**
   * Edit an existing hotspot
   */
  const editHotspot = () => {
    if (!selectedHotspotID.value) {
      toastStore.showToast("error", "Could not find hotspot");
      console.error("Hotspot ID not found");
      return;
    }

    editingHotspotID.value = selectedHotspotID.value;
    closeHotspot();
    isEditingHotspot.value = true;
  };

  /**
   * Delete a hotspot
   */
  const deleteHotspot = () => {
    if (!selectedHotspotID.value) {
      toastStore.showToast("error", "Could not delete hotspot");
      console.error("Hotspot ID not found");
      return;
    }

    const id = selectedHotspotID.value;
    closeHotspot();
    hotspotStore.deleteHotspot(id, scene, modelScale);
  };

  /**
   * Save new or update hotspot data
   */
  const saveHotspotData = () => {
    // New hotspot
    if (
      !newPosition.value ||
      !newNormal.value ||
      !newQuaternion.value ||
      newLabel.value === "" ||
      newContent.value === ""
    ) {
      toastStore.showToast("error", "Invalid hotspot data!");
      return;
    }

    const newKey = hotspotStore.addHotspot(
      newLabel.value,
      newContent.value,
      newPosition.value,
      newNormal.value,
      newQuaternion.value,
    );

    const pos = new THREE.Vector3(
      newPosition.value.x,
      newPosition.value.y,
      newPosition.value.z,
    );
    const nor = new THREE.Vector3(
      newNormal.value.x,
      newNormal.value.y,
      newNormal.value.z,
    );

    if (unsavedMarker.value) {
      hotspotStore.addMarker(newKey, unsavedMarker.value, pos, nor);
      unsavedMarker.value = null;
    }

    hotspotStore.setHotspotMode(false);

    isEditingHotspot.value = false;
    toastStore.showToast("success", "Hotspot saved!");

    newLabel.value = "";
    newContent.value = "";
  };

  /**
   * Disposes geometries and materials of the Hotspot marker
   */
  const deleteHotspot3DObject = (marker: THREE.Mesh) => {
    marker.parent?.remove(marker);

    marker.geometry.dispose();
    if (Array.isArray(marker.material)) {
      marker.material.forEach((mat) => mat.dispose());
    } else {
      marker.material.dispose();
    }
  };

  /**
   * Cleans loaded textures used for 3D hotspots
   */
  const textureCleanup = () => {
    defaultIconTexture.dispose();
    highlightIconTexture.dispose();
  };

  return {
    addHotspotMarker,
    loadExistingHotspots,
    newHotspotOnClick,
    moveCameraToHotspot,
    openHotspot,
    isHotspotOpen,
    editHotspot,
    isEditingHotspot,
    editingHotspotID,
    selectedHotspotID,
    closeHotspot,
    deleteHotspot,
    saveHotspotData,
    hightlightHotspotsOnHover,
    hoveredMarker,
    deleteHotspot3DObject,
    textureCleanup,
    toggleHotspotMarkers,
    unsavedMarker,
  };
};
