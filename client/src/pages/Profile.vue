<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <div class="w-full mx-auto max-w-130 pb-6 border-b border-grayscale-200">
        <h1 class="title text-grayscale-900 mb-5">Profile Settings</h1>
        <div class="flex flex-col gap-1 mb-4">
          <label for="casId" class="subtitle text-primary-500">SFU ID</label>
          <input
            id="casId"
            name="casId"
            type="text"
            disabled
            :value="userStore.user?.casId"
            class="bg-white rounded border border-grayscale-300 px-2 py-1 text-grayscale-600 cursor-not-allowed"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="display_name" class="subtitle text-primary-500"
            >Display Name</label
          >
          <input
            id="display_name"
            name="display_name"
            type="text"
            v-model="displayName"
            class="bg-white rounded border border-grayscale-300 px-2 py-1 text-grayscale-900"
          />
        </div>
      </div>
      <div class="flex justify-between w-full mx-auto max-w-130 mt-6">
        <Button
          @click="handleSaveChanges"
          type="success"
          :disabled="!hasChanged || userStore.loading"
          >{{ userStore.loading ? "Saving..." : "Save Changes" }}</Button
        >
        <Button @click="handleLogout" type="secondary">Logout</Button>
      </div>
    </div>

    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import axiosInstance from "../scripts/axiosConfig";
import { useUserStore } from "../stores/userStore";
import { useToastStore } from "../stores/toastStore";
import { useRouter } from "vue-router";
import Footer from "../components/Footer.vue";
import Button from "../components/Button.vue";
import { onMounted, ref, computed } from "vue";

const displayName = ref("");
const hasChanged = computed(
  () => displayName.value !== (userStore.user?.displayName ?? ""),
);

const userStore = useUserStore();
const toastStore = useToastStore();
const router = useRouter();

const handleSaveChanges = async () => {
  await userStore.updateUser(displayName.value);
  toastStore.showToast("success", "Your changes have been saved!");
};

const handleLogout = async () => {
  try {
    const { status } = await axiosInstance.post("/user/logout");

    if (status === 200) {
      userStore.clearUser();
    }
  } catch (err) {
    console.error("Failed to log out user ", err);
  }
};

onMounted(() => {
  if (!userStore.user) {
    console.error("[Profile.vue] No user in user state");
    router.back();
  } else {
    displayName.value = userStore.user.displayName || "";
  }
});
</script>
