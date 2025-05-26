import { ref, nextTick } from "vue";
import { type Model } from "../types/model.ts";

const toEdit = ref<Model | null>();
const originalModel = ref<Model | null>();
const isEditOpen = ref(false);

const isValid = ref(false);
const nameError = ref<string | null>(null);
const captionError = ref<string | null>(null);
const descriptionError = ref<string | null>(null);

export const useEdit = () => {
  const loading = ref(false);
  const error = ref<any>(null);

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
    toEdit.value = null;
    originalModel.value = null;
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
  };
};
