import { type Mesh, type Vector3 } from "three";

export type Model = {
  id: string;
  accNum: string;
  name: string;
  caption: string;
  description: string;
  provenance: string;
  materials: Material[];
  tags: Tag[];
  dimensions: ModelDimension[];
  hotspots: ModelHotspot[];
  modelPath: string;
  thumbnailPath: string;
  downloadable: boolean;
  createdAt: string;
};

export type ModelDimension = {
  type: "WIDTH" | "HEIGHT" | "DEPTH" | "WEIGHT" | "VOLUME";
  value: number;
  unit: string;
};

export type ModelHotspot = {
  id: number;
  modelId: string;
  label: string;
  content: string;
  posX: number;
  posY: number;
  posZ: number;
  norX: number;
  norY: number;
  norZ: number;
  quatX: number;
  quatY: number;
  quatZ: number;
  quatW: number;
};

// Filters
export type Material = {
  name: string;
};

export type Tag = {
  name: string;
};

//Hotspots
export type Hotspot = {
  position: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
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

// Dimensions
export type DimensionKey = "width" | "height" | "depth" | "weight" | "volume";

export type Dimension = {
  name: "Width" | "Height" | "Depth" | "Weight" | "Volume";
  value: number | null;
  unit: string | null;
  units: string[];
};
