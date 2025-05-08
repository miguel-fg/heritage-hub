import { type Mesh, type Vector3 } from "three";

export type Hotspot = {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  label: string;
  content: string;
};

export type HotspotMarker = {
  id: number;
  marker: Mesh;
  position: Vector3;
  normal: Vector3;
};
