import { ref } from "vue";

type DimensionKey = "width" | "height" | "depth" | "weight" | "volume";
type DimensionType = "Width" | "Height" | "Depth" | "Weight" | "Volume";

interface Dimension {
  name: DimensionType;
  value: number | null;
  unit: string | null;
  units: string[];
}

const dimensions = ref<Record<DimensionKey, Dimension>>({
  width: {
    name: "Width",
    value: null,
    unit: null,
    units: ["mm", "cm", "m", "in", "ft"],
  },
  height: {
    name: "Height",
    value: null,
    unit: null,
    units: ["mm", "cm", "m", "in", "ft"],
  },
  depth: {
    name: "Depth",
    value: null,
    unit: null,
    units: ["mm", "cm", "m", "in", "ft"],
  },
  weight: {
    name: "Weight",
    value: null,
    unit: null,
    units: ["g", "kg", "oz", "lb"],
  },
  volume: {
    name: "Volume",
    value: null,
    unit: null,
    units: ["ml", "l", "fl oz", "gal"],
  },
});

const setValue = (key: DimensionKey, value: number | null) => {
  dimensions.value[key].value = value;
};

const setUnit = (key: DimensionKey, unit: string | null) => {
  const dimension = dimensions.value[key];
  if (unit && !dimension.units.includes(unit)) return;

  dimension.unit = unit;
};

const clearDimension = (key: DimensionKey) => {
  dimensions.value[key].value = null;
  dimensions.value[key].unit = null;
};

export const useDimensions = () => {
  return { dimensions, setValue, setUnit, clearDimension };
};
