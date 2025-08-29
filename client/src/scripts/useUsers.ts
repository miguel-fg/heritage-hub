import { ref } from "vue";
import type { PermissionLevel, UserWithCount } from "../types/user";
import axiosInstance from "./axiosConfig";

const editedUsers = ref<Map<string, Partial<UserWithCount>>>(new Map());
const resetCounter = ref(0);

export const useUsers = () => {
  const loading = ref(false);

  const addEditedUser = (id: string, displayName: string, permissions: PermissionLevel) => {
    editedUsers.value.set(id, {id, displayName, permissions});
  }

  const removeEditedUser = (id: string) => {
    editedUsers.value.delete(id);
  }

  const saveEditedUsers = async () => {
    if (editedUsers.value.size === 0) {
      return [];
    }

    loading.value = true;

    try {
      const changedUsers = Array.from(editedUsers.value.values());
      const { status, data } = await axiosInstance.patch("/user/all", { changedUsers });

      if (status === 200) {
        editedUsers.value = new Map();
        return data.updated;
      }
    } catch (err) {
      console.error("[useUsers]: Failed to save user changes. ", err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  const resetEditedUsers = () => {
    resetCounter.value++;
    editedUsers.value.clear();
  }

  return { editedUsers, addEditedUser, removeEditedUser, saveEditedUsers, resetCounter, resetEditedUsers }
}
