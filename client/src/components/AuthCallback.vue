<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0 flex justify-center items-center"
    >
      <h1 class="title text-primary-500">Signing you in...</h1>
    </div>
    <div class="w-full mt-30">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import axiosInstance from "../scripts/axiosConfig";
import { useUserStore } from "../stores/userStore";
import { nextTick, onMounted } from "vue";
import Footer from "./Footer.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  await nextTick();

  const otc = route.query.otc as string | undefined;

  if (!otc) {
    console.error("No OTC in query");
    return router.replace({ name: "Gallery" });
  }

  try {
    await axiosInstance.post("/user/otc", { otc });

    await userStore.fetchUser();

    router.replace({ name: "Gallery" });
  } catch (err) {
    console.error("OTC exchange failed", err);
    router.replace({ name: "Gallery" });
  }
});
</script>
