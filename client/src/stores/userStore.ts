import { defineStore } from "pinia";
import axiosInstance from "../scripts/axiosConfig";
import { ref } from "vue";

interface User {
  id: string;
  casId: string;
  authType?: string;
  displayName?: string;
  permissions: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const canAccess = ref(false);
  const isAdmin = ref(false);
  const loading = ref(true);

  const fetchUser = async () => {
     loading.value = true

     try {
       const { data } = await axiosInstance.get("/user/me")

       if(data.user){
         user.value = data.user;
         canAccess.value = data.user.permissions !== "RESTRICTED"
         isAdmin.value = data.user.permissions === "ADMIN"
       }
     } catch (err) {
       user.value = null;
       canAccess.value = false;
       isAdmin.value = false;
     } finally {
       loading.value = false
     }
  }

  const updateUser = async (displayName: string) => {
    if (!user.value) return;

    loading.value = true

    try {
      const { data } = await axiosInstance.patch("/user/me", { displayName });

      if(data.displayName) {
        user.value.displayName = data.displayName;
      }
    } catch (err) {
      console.error("[userStore]: Failed to update user. ERR: ", err);
    } finally {
      loading.value = false
    }
  }

  const clearUser = () => {
    user.value = null;
    canAccess.value = false;
    isAdmin.value = false;
    loading.value = false;
  }

  return { user, canAccess, isAdmin, loading, fetchUser, updateUser, clearUser }
})
