<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <h1 class="title text-grayscale-900 mb-8" las>Registered Users</h1>
      <div class="rounded bg-white flex p-2 md:p-4 lg:p-6 mb-8 gap-4">
        <label
          for="searchbar"
          class="flex pl-2 border border-grayscale-300 w-full rounded-xs"
        >
          <img
            src="../../assets/icons/search.svg"
            alt="Search bar"
            class="w-4"
          />
          <input
            id="searchbar"
            type="text"
            v-model="searchQuery"
            class="font-poppins w-full py-1 px-2"
            placeholder="Search users"
            @click.stop
            @touchstart.stop
          />
        </label>
        <Button type="primary">Search</Button>
      </div>
      <div v-if="!loading && filteredUsers.length > 0">
        <div v-if="showMobile" class="space-y-8 rounded overflow-y-visible">
          <UserRowMobile v-for="user in filteredUsers" :user="user" />
        </div>
        <div v-else class="bg-white p-6 rounded overflow-y-visible">
          <table
            class="table-fixed mx-auto border-separate border-spacing-2 w-full"
          >
            <thead class="subtitle text-primary-500">
              <tr class="border-b border-grayscale-200">
                <th class="text-start">Name</th>
                <th class="text-start">CAS ID</th>
                <th class="text-center w-20 lg:w-40">Models</th>
                <th class="text-center w-40 lg:w-60">Permissions</th>
                <th class="w-20 lg:w-30">&nbsp;</th>
              </tr>
            </thead>
            <tbody class="font-poppins font-regular">
              <UserRow v-for="user in filteredUsers" :user="user" />
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-else-if="!loading && filteredUsers.length === 0"
        class="flex items-center justify-center font-poppins font-medium text-grayscale-700"
      >
        No users match your search query
      </div>
      <div v-else-if="loading" class="flex items-center justify-center">
        <Spinner :size="30" class="fill-primary-500" />
      </div>
      <div v-show="editedUsers.size > 0" class="flex justify-end gap-2 mt-4">
        <Button @click="handleSaveChanges" type="success">
          {{
            `Save ${editedUsers.size} change${editedUsers.size > 1 ? "s" : ""}`
          }}
        </Button>
        <Button @click="handleCancelAll" type="danger">Cancel all</Button>
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
import { useUsers } from "../scripts/useUsers";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import type { UserWithCount } from "../types/user";
import UserRow from "../components/UserRow.vue";
import Footer from "../components/Footer.vue";
import Spinner from "../components/Spinner.vue";
import Button from "../components/Button.vue";
import { useTailwindBreakpoints } from "../scripts/useTailwindBreakpoints";
import UserRowMobile from "../components/UserRowMobile.vue";

const users = ref<UserWithCount[]>([]);
const loading = ref(false);

const userStore = useUserStore();
const router = useRouter();

const { editedUsers, saveEditedUsers, resetEditedUsers } = useUsers();

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { status, data } = await axiosInstance.get("/user/all");

    if (status === 200) {
      users.value = data.users;
    }
  } catch (err) {
    console.error("[Users.vue]: Failed to fetch users. ", err);
  } finally {
    loading.value = false;
  }
};

const searchQuery = ref("");
const filteredUsers = computed(() =>
  users.value.filter(
    (user) =>
      user.displayName
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      user.casId.includes(searchQuery.value.toLowerCase()),
  ),
);

const handleSaveChanges = async () => {
  loading.value = true;
  const updatedUsers = await saveEditedUsers();
  if (!updatedUsers || updatedUsers.length === 0) return;

  users.value = users.value.map((user) => {
    const updated = updatedUsers.find((u: UserWithCount) => u.id === user.id);
    return updated ? { ...user, ...updated } : user;
  });
  editedUsers.value = new Map();

  loading.value = false;
};

const handleCancelAll = () => {
  resetEditedUsers();
};

const { current } = useTailwindBreakpoints();
const showMobile = computed(
  () => current.value === "xs" || current.value === "sm",
);

onMounted(async () => {
  if (!userStore.user || userStore.user.permissions !== "ADMIN") {
    router.replace("/");
  } else {
    await fetchUsers();
  }
});
</script>
