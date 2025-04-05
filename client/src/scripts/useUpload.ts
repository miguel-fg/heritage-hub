import { ref } from "vue";

const mName = ref<string>("");
const nameError = ref<string | null>(null);
const mCaption = ref<string>("");
const captionError = ref<string | null>(null);
const mDescription = ref<string>("");
const descriptionError = ref<string | null>(null);

const isValid = ref(false);
const uploadAttempted = ref(false);

export const useUpload = () => {
  const validateField = (field: "Name" | "Caption" | "Description") => {
    let value: string;

    let MIN_LENGTH: number;
    let MAX_LENGTH: number;

    switch (field) {
      case "Name":
        mName.value = mName.value.trim();
        value = mName.value;
        MIN_LENGTH = 3;
        MAX_LENGTH = 75;

        if (!value) {
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
        mCaption.value = mCaption.value.trim();
        value = mCaption.value;
        MIN_LENGTH = 10;
        MAX_LENGTH = 250;

        if (!value) {
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
        mDescription.value = mDescription.value.trim();
        value = mDescription.value;
        MIN_LENGTH = 20;
        MAX_LENGTH = 2000;

        if (!value) {
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
    isValid.value =
      !nameError.value && !captionError.value && !descriptionError.value;
  };

  return {
    mName,
    nameError,
    mCaption,
    captionError,
    mDescription,
    descriptionError,
    isValid,
    uploadAttempted,
    validateField,
    validateForm,
  };
};
