<template>
  <EditModal @save="handleExitEdit" @cancel="handleExitEdit" />
</template>

<script setup lang="ts">
import EditModal from "../components/edit/EditModal.vue";
import { useEdit } from "../scripts/useEdit";
import { useRouter } from "vue-router";

const router = useRouter();
const { resetEditState } = useEdit();

const handleExitEdit = () => {
  resetEditState();
  router.back();
};
</script>
