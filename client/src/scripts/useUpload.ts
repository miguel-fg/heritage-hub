import { ref } from "vue";
import axiosInstance from "./axiosConfig";
import {
  type DimensionKey,
  type Dimension,
  type Hotspot,
} from "../types/model";
import axios from "axios";

// GLB File
const file = ref<File | null>(null);

// Upload modal control
const isUploadOpen = ref(false);

// ModelForm fields
const mName = ref<string>("");
const nameError = ref<string | null>(null);
const mCaption = ref<string>("");
const captionError = ref<string | null>(null);
const mDescription = ref<string>("");
const descriptionError = ref<string | null>(null);
const mAccNum = ref<string>("");

// Dimensions
const selectedDimensions = ref<Record<DimensionKey, Dimension>>({
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

// Tags
const selectedTags = ref<{ name: string }[] | null>(null);

// Materials
const selectedMaterials = ref<{ name: string }[] | null>(null);

// Hotspots
const selectedHotspots = ref<Record<number, Hotspot>>({});

// Thumbnail
const thumbnail = ref<string | null>(null);

// Download
const downloadable = ref(false);

const isValid = ref(false);
const uploadAttempted = ref(false);

export const useUpload = () => {
  const loading = ref(false);
  const error = ref<any>(null);

  const publishModel = async (modelId: string): Promise<boolean> => {
    loading.value = true;

    const formData = {
      id: modelId,
      name: mName.value,
      caption: mCaption.value,
      description: mDescription.value,
      downloadable: downloadable.value,
      materials: sanitizeMultiselect(selectedMaterials.value),
      tags: sanitizeMultiselect(selectedTags.value),
      dimensions: sanitizeDimensions(selectedDimensions.value, modelId),
      hotspots: sanitizeHotspots(selectedHotspots.value, modelId),
    };

    let uploadSuccess = false;

    try {
      await axiosInstance.post("/models", formData);
      uploadSuccess = true;
    } catch (err) {
      console.error(`[useUpload] Failed to publish model. ERR: ${err}`);
      error.value = err;
      uploadSuccess = false;
    } finally {
      loading.value = false;
      return uploadSuccess;
    }
  };

  const validateField = (field: "Name" | "Caption" | "Description") => {
    let value: string;

    let MIN_LENGTH: number;
    let MAX_LENGTH: number;

    switch (field) {
      case "Name":
        value = mName.value;
        MIN_LENGTH = 3;
        MAX_LENGTH = 75;

        if (!value || value.trim() === "") {
          nameError.value = "Name is required.";
        } else if (value.length < MIN_LENGTH) {
          nameError.value = `Name must be at least ${MIN_LENGTH} characters.`;
        } else if (value.length > MAX_LENGTH) {
          nameError.value = `Name must be no more than ${MAX_LENGTH} characters.`;
        } else {
          nameError.value = null;
        }
        break;
      case "Caption":
        value = mCaption.value;
        MIN_LENGTH = 10;
        MAX_LENGTH = 250;

        if (!value || value.trim() === "") {
          captionError.value = "Caption is required.";
        } else if (value.length < MIN_LENGTH) {
          captionError.value = `Caption must be at least ${MIN_LENGTH} characters.`;
        } else if (value.length > MAX_LENGTH) {
          captionError.value = `Caption must be no more than ${MAX_LENGTH} characters.`;
        } else {
          captionError.value = null;
        }
        break;
      case "Description":
        value = mDescription.value;
        MIN_LENGTH = 20;
        MAX_LENGTH = 2000;

        if (!value || value.trim() === "") {
          descriptionError.value = "Description is required.";
        } else if (value.length < MIN_LENGTH) {
          descriptionError.value = `Description must be at least ${MIN_LENGTH} characters.`;
        } else if (value.length > MAX_LENGTH) {
          descriptionError.value = `Description must be no more than ${MAX_LENGTH} characters.`;
        } else {
          descriptionError.value = null;
        }
        break;
    }
  };

  const validateForm = () => {
    validateField("Name");
    validateField("Caption");
    validateField("Description");

    isValid.value =
      !nameError.value && !captionError.value && !descriptionError.value;
  };

  const sanitizeMultiselect = (
    selected: { name: string }[] | null,
  ): string[] => {
    if (!selected) return [];

    const result: string[] = [];

    for (const s of selected) {
      result.push(s.name);
    }

    return result;
  };

  const sanitizeDimensions = (
    dimensions: Record<DimensionKey, Dimension>,
    modelId: string,
  ): {
    modelId: string;
    type: string;
    value: number;
    unit: string;
  }[] => {
    if (!dimensions) return [];

    const result: {
      modelId: string;
      type: string;
      value: number;
      unit: string;
    }[] = [];

    for (const key of Object.keys(dimensions)) {
      const { name, value, unit } = dimensions[key as keyof typeof dimensions];

      if (!value || !unit) continue;

      result.push({ modelId, type: name.toUpperCase(), value, unit });
    }

    return result;
  };

  const sanitizeHotspots = (
    hotspots: Record<number, Hotspot>,
    modelId: string,
  ) => {
    const result: {
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
    }[] = [];

    for (const h of Object.values(hotspots)) {
      result.push({
        modelId,
        label: h.label,
        content: h.content,
        posX: h.position.x,
        posY: h.position.y,
        posZ: h.position.z,
        norX: h.normal.x,
        norY: h.normal.y,
        norZ: h.normal.z,
        quatX: h.quaternion.x,
        quatY: h.quaternion.y,
        quatZ: h.quaternion.z,
        quatW: h.quaternion.w,
      });
    }

    return result;
  };

  const getObjectUploadUrl = async (modelId: string) => {
    try {
      const response = await axiosInstance.post(`/models/upload-url`, {
        modelId,
      });

      const urls = response.data;

      return urls;
    } catch (error) {
      console.error("Failed to fetch upload presigned URL. ERR: ", error);
      return null;
    }
  };

  const uploadModeltoR2 = async (file: File, presignedUrl: string) => {
    try {
      const response = await axios.put(presignedUrl, file);

      if (response.status >= 200 && response.status < 300) {
        return true;
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error uploading file to Cloudflare R2. ERR: ", error);
      return false;
    }
  };

  const openUpload = () => {
    isUploadOpen.value = true;
  };

  const closeUpload = () => {
    resetUploadState();
    isUploadOpen.value = false;
  };

  const resetUploadState = () => {
    // Reset file
    file.value = null;

    // Reset modal control
    isUploadOpen.value = false;

    // Reset form fields
    mName.value = "";
    nameError.value = null;
    mCaption.value = "";
    captionError.value = null;
    mDescription.value = "";
    descriptionError.value = null;
    mAccNum.value = "";

    // Reset dimensions
    selectedDimensions.value = {
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
    };

    // Reset tags and materials
    selectedTags.value = null;
    selectedMaterials.value = null;

    // Reset hotspots
    selectedHotspots.value = {};

    // Reset thumbnail
    thumbnail.value = null;

    // Reset download option
    downloadable.value = false;

    // Reset validation states
    isValid.value = false;
    uploadAttempted.value = false;

    // Reset loading and error states
    loading.value = false;
    error.value = null;
  };

  return {
    file,
    mName,
    nameError,
    mCaption,
    captionError,
    mDescription,
    descriptionError,
    mAccNum,
    thumbnail,
    downloadable,
    selectedTags,
    selectedMaterials,
    selectedDimensions,
    selectedHotspots,
    isValid,
    uploadAttempted,
    validateField,
    validateForm,
    loading,
    publishModel,
    isUploadOpen,
    openUpload,
    closeUpload,
    getObjectUploadUrl,
    uploadModeltoR2,
    resetUploadState,
  };
};
