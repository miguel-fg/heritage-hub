<template>
  <h1 class="title text-grayscale-900 ml-4 md:ml-8 lg:ml-16">
    Profile Preferences
  </h1>
</template>

<script setup lang="ts">
import axiosInstance from "../scripts/axiosConfig";
import { useUserStore } from "../stores/userStore";

const userStore = useUserStore();

const handleLogout = async () => {
  const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT!;

  const apiBaseUrl =
    ENVIRONMENT === "prod"
      ? import.meta.env.VITE_PROD_SERVER_URL
      : import.meta.env.VITE_DEV_SERVER_URL;

  if (!apiBaseUrl) {
    console.error("API base URL not set");
    return;
  }

  try {
    const { status } = await axiosInstance.post("/user/logout");

    if (status === 200) {
      userStore.clearUser();
    }
  } catch (err) {
    console.error("Failed to log out user ", err);
  }
};
</script>
