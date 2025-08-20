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
  const loading = ref(true);

  const fetchUser = async () => {
     loading.value = true

     try {
       const { data } = await axiosInstance.get("/user/me")

       user.value = data.user;
     } catch (err) {
       user.value = null
     } finally {
       loading.value = false
     }
  }

  const clearUser = () => {
    user.value = null;
    loading.value = false;
  }

  return { user, loading, fetchUser, clearUser }
})
