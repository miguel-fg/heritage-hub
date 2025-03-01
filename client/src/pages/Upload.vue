<template>
  <div class="flex flex-col gap-5 mt-28">
    <h1 class="title text-grayscale-900">Upload Page!</h1>
    <Toast type="success" message="Model updated successfully!" />
    <Toast type="error" message="Uh oh! Something went wrong." />
    <Button @click="showModal" type="primary">Open Modal</Button>
    <Modal v-show="modalIsVisible" @close="hideModal">
      <template v-slot:title>
        <div class="flex flex-col gap-3 items-center">
          <h1 class="title text-grayscale-900">Confirm deletion</h1>
          <h2 class="font-poppins text-grayscale-700 text-center">
            Are you sure you want to delete this model?
          </h2>
        </div>
      </template>
      <template v-slot:warning>
        <div
          class="px-3 py-2 bg-warning-100 font-poppins text-xs border border-warning-600 rounded-xs"
        >
          <div class="flex items-center gap-1 tag text-warning-800 mb-2">
            <img
              src="../../assets/icons/warning-yellow.svg"
              alt="Warning icon"
            />
            Warning
          </div>
          <p class="text-warning-900">
            Deleting this model will
            <span class="tag">permanently delete</span> all information,
            hotspots, and comments associated with it.
          </p>
        </div>
      </template>
      <template v-slot:buttons>
        <div class="flex justify-center items-center gap-5">
          <Button @click="hideModal" type="secondary">No, cancel</Button>
          <Button type="danger">Yes, delete it</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Toast from "../components/Toast.vue";
import Button from "../components/Button.vue";
import Modal from "../components/Modal.vue";

const modalIsVisible = ref(false);

const showModal = () => {
  modalIsVisible.value = true;
};

const hideModal = () => {
  modalIsVisible.value = false;
};
</script>
