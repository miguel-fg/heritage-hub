<template>
  <div
    class="flex flex-col w-full rounded-xs px-3 py-2 gap-2 border border-grayscale-300"
  >
    <InfoMessage type="info">
      <template #title>Hotspot Mode</template>
      <template #content
        >Click anywhere on the model to add a new hotspot</template
      >
    </InfoMessage>
    <div class="flex flex-col gap-1">
      <InputField
        field-id="hotspot-label"
        label="Label"
        v-model="newLabel"
        :error="labelError"
        :show-error="showValidation"
      />
      <TextArea
        field-id="hotspot-content"
        label="Content"
        v-model="newContent"
        :error="contentError"
        :show-error="showValidation"
        :rows="2"
      />
    </div>
    <div class="flex justify-between mt-3">
      <Button @click="emit('exit')" type="secondary">Cancel hotspot</Button>
      <Button @click="handleSave" type="success">Save hotspot</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useHotspotStore } from "../../stores/hotspotStore";
import { useToastStore } from "../../stores/toastStore";
import { storeToRefs } from "pinia";
import Button from "../Button.vue";
import InputField from "../InputField.vue";
import TextArea from "../TextArea.vue";
import InfoMessage from "../InfoMessage.vue";

const emit = defineEmits(["saved", "exit"]);

const toastStore = useToastStore();
const hotspotStore = useHotspotStore();
const { newLabel, newContent, newPosition, newNormal, newQuaternion } =
  storeToRefs(hotspotStore);

const labelError = ref("");
const contentError = ref("");

const showValidation = ref(false);

const handleSave = () => {
  const isFormValid = validateForm();
  showValidation.value = true;

  if (!isFormValid) {
    toastStore.showToast("error", "Invalid hotspot data!");
    return;
  }

  if (!newPosition.value || !newNormal.value || !newQuaternion.value) {
    toastStore.showToast("error", "Please click on the model to add a marker");
    return;
  }

  emit("saved");
};

const validateForm = (): boolean => {
  if (newLabel.value === "") {
    labelError.value = "The hotspot label cannot be empty.";
  } else {
    labelError.value = "";
  }

  if (newContent.value === "") {
    contentError.value = "The hotspot content cannot be empty.";
  } else {
    contentError.value = "";
  }

  return labelError.value === "" && contentError.value === "";
};
</script>
