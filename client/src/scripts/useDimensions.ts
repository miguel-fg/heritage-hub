import { ref } from "vue";
import convert, { type Unit } from "convert";
import type { ModelDimension } from "../types/model";

type DimensionKey = "width" | "height" | "depth" | "weight" | "volume";
type DimensionType = "Width" | "Height" | "Depth" | "Weight" | "Volume";

interface Dimension {
  name: DimensionType;
  value: number | null;
  unit: string | null;
  units: string[];
}

const metricUnits = ["mm", "cm", "m", "g", "kg", "ml", "l"];
const imperialUnits = ["in", "ft", "oz", "lb", "fl oz", "gal"];

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

export const useDimensions = () => {
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

  const getUnitSystem = (unit: string): "metric" | "imperial" | null => {
    if (metricUnits.includes(unit)) return "metric";
    if (imperialUnits.includes(unit)) return "imperial";
    return null;
  };

  const formatDimension = (dimension: {
    type: "WIDTH" | "HEIGHT" | "DEPTH" | "WEIGHT" | "VOLUME";
    value: number;
    unit: string;
  }): string => {
    const dimName =
      dimension.type[0] + dimension.type.substring(1).toLowerCase();
    const { value, unit } = dimension;
    const origStr = `${value.toFixed(2)} ${unit}`;

    const system = getUnitSystem(unit);
    if (!system) return `${dimName}: ${origStr}`;
    const oppositeSystem = system === "metric" ? "imperial" : "metric";

    try {
      const converted = convert(value, unit as Unit).to("best", oppositeSystem);
      const convStr = `${converted.quantity.toFixed(2)} ${converted.unit}`;

      return `${dimName}: ${origStr} / ${convStr}`;
    } catch (error) {
      console.warn(
        `[useDimensions]: Conversion error for ${value} ${unit}. ERR: ${error}`,
      );
      return `${dimName}: ${origStr}`;
    }
  };

  const dbToRecord = (dbDimensions: ModelDimension[]) => {
    if (!dbDimensions) {
      console.error("[useDimensions]: ModelDimensions[] parameter not found.");
      return false;
    }

    const dimensionMap = {
      WIDTH: "width",
      HEIGHT: "height",
      DEPTH: "depth",
      WEIGHT: "weight",
      VOLUME: "volume",
    } as const;

    dbDimensions.forEach((dim) => {
      const key = dimensionMap[dim.type] as keyof typeof dimensions.value;

      if (key && dimensions.value[key]) {
        dimensions.value[key].value = dim.value;
        dimensions.value[key].unit = dim.unit;
      }
    });
  };

  const resetDimensions = () => {
    clearDimension("width");
    clearDimension("height");
    clearDimension("depth");
    clearDimension("weight");
    clearDimension("volume");
  };

  return {
    dimensions,
    setValue,
    setUnit,
    clearDimension,
    formatDimension,
    resetDimensions,
    dbToRecord,
  };
};
