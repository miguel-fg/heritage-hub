import { ref, nextTick } from "vue";
import { useUpload } from "./useUpload.ts";
import { type Model } from "../types/model.ts";
import axiosInstance from "./axiosConfig.ts";
import { dataUrlToFile } from "./hhUtils.ts";
import { useToastStore } from "../stores/toastStore.ts";
import {
  type DimensionKey,
  type Dimension,
  type Hotspot,
} from "../types/model";
import { useDimensions } from "./useDimensions.ts";
import { useHotspotStore } from "../stores/hotspotStore.ts";

const toEdit = ref<Model | null>();
const originalModel = ref<Model | null>();
const originalThumbnail = ref("");
const isEditOpen = ref(false);

const isValid = ref(false);
const nameError = ref<string | null>(null);
const captionError = ref<string | null>(null);
const descriptionError = ref<string | null>(null);

export const useEdit = () => {
  const loading = ref(false);
  const error = ref<any>(null);

  const toastStore = useToastStore();
  const hotspotStore = useHotspotStore();

  const initEditState = async (model: Model): Promise<boolean> => {
    originalModel.value = model;
    toEdit.value = JSON.parse(JSON.stringify(model));

    await nextTick();

    if (originalModel.value && toEdit.value) {
      return true;
    }

    return false;
  };

  const resetEditState = () => {
    const { resetDimensions } = useDimensions();

    toEdit.value = null;
    originalModel.value = null;

    nameError.value = null;
    captionError.value = null;
    descriptionError.value = null;

    resetDimensions();
  };

  const openEdit = () => {
    isEditOpen.value = true;
  };

  const closeEdit = () => {
    isEditOpen.value = false;
  };

  const validateField = (field: "Name" | "Caption" | "Description") => {
    let value;

    let MIN_LENGTH: number;
    let MAX_LENGTH: number;

    switch (field) {
      case "Name":
        value = toEdit.value?.name;
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
        value = toEdit.value?.caption;
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
        value = toEdit.value?.description;
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

  const saveChanges = async () => {
    if (!isValid || !toEdit.value) return;

    const { thumbnail, getObjectUploadUrl, uploadModeltoR2 } = useUpload();

    if (!thumbnail.value) return;

    loading.value = true;

    if (originalThumbnail.value !== thumbnail.value) {
      console.log("[useEdit.ts]: New thumbnail detected.");
      console.log("[useEdit.ts]: Uploading new thumbnail to Cloudflare...");

      const { thumbnailUrl } = await getObjectUploadUrl(toEdit.value.id);
      const thumbnailUploaded = await uploadModeltoR2(
        dataUrlToFile(thumbnail.value),
        thumbnailUrl,
      );

      if (!thumbnailUploaded) {
        toastStore.showToast("error", "Failed to update thumbnail");
        return false;
      }
      console.log("[useEdit.ts]: SUCCESS");
    } else {
      console.log("[useEdit.ts]: Thumbnail unchanged. R2 upload skipped.");
    }

    console.log("[useEdit.ts]: Writing changes to database");
    try {
      const data = buildFormData();
      await axiosInstance.post("/models/update", data);
      console.log(`[useEdit.ts]: SUCCESS`);
      loading.value = false;
      return true;
    } catch (err) {
      console.error(`[useEdit.ts]: Failed to update model. ERR: ${err}`);
      error.value = err;
      loading.value = false;
      return false;
    }
  };

  const buildFormData = () => {
    if (!toEdit.value) return;

    const { dimensions } = useDimensions();
    const { downloadable } = useUpload();

    const formData = {
      id: toEdit.value.id,
      name: toEdit.value.name,
      caption: toEdit.value.caption,
      description: toEdit.value.description,
      downloadable: downloadable.value,
      accNum: toEdit.value.accNum,
      provenance: toEdit.value.provenance,
      materials: sanitizeMultiselect(toEdit.value.materials),
      tags: sanitizeMultiselect(toEdit.value.tags),
      dimensions: sanitizeDimensions(dimensions.value, toEdit.value.id),
      hotspots: sanitizeHotspots(hotspotStore.hotspots, toEdit.value.id),
    };

    return formData;
  };

  const sanitizeMultiselect = (
    selected: { name: string }[] | null,
  ): { where: { name: string }; create: { name: string } }[] => {
    if (!selected) return [];

    const result: { where: { name: string }; create: { name: string } }[] = [];

    for (const s of selected) {
      result.push({ where: { name: s.name }, create: { name: s.name } });
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

  return {
    initEditState,
    resetEditState,
    loading,
    error,
    toEdit,
    isEditOpen,
    openEdit,
    closeEdit,
    isValid,
    nameError,
    captionError,
    descriptionError,
    validateField,
    validateForm,
    originalThumbnail,
    saveChanges,
  };
};
