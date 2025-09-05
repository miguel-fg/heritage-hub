<template>
  <div class="w-full @container">
    <div
      class="w-full h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <h1 class="title text-grayscale-900 mb-8" las>Registered Users</h1>
      <div class="rounded bg-white flex p-2 md:p-4 gap-4">
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
      <div v-if="!loading && filteredUsers.length > 0" class="h-4/7">
        <div v-if="showMobile" class="space-y-8 rounded overflow-y-visible">
          <UserRowMobile v-for="user in filteredUsers" :user="user" />
        </div>
        <div v-else class="bg-white p-6 rounded overflow-y-auto h-full">
          <table
            class="table-fixed mx-auto border-separate border-spacing-2 w-full"
          >
            <thead class="subtitle text-primary-500">
              <tr class="border-b border-grayscale-200">
                <th
                  class="text-start cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200"
                  @click="toggleSort('name')"
                >
                  <span class="flex gap-2 items-center"
                    >Name

                    <Icon
                      v-show="sortField === 'name'"
                      :icon="
                        sortDirection === 'asc' ? 'bx:sort-a-z' : 'bx:sort-z-a'
                      "
                      inline
                    />
                  </span>
                </th>
                <th
                  class="text-start cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200"
                  @click="toggleSort('casId')"
                >
                  <span class="flex gap-2 items-center">
                    CAS ID
                    <Icon
                      v-show="sortField === 'casId'"
                      :icon="
                        sortDirection === 'asc' ? 'bx:sort-a-z' : 'bx:sort-z-a'
                      "
                      inline
                    />
                  </span>
                </th>
                <th
                  class="text-center w-20 lg:w-40 cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200"
                  @click="toggleSort('models')"
                >
                  <span class="flex gap-2 items-center justify-center">
                    Models
                    <Icon
                      v-show="sortField === 'models'"
                      :icon="
                        sortDirection === 'asc' ? 'bx:sort-up' : 'bx:sort-down'
                      "
                      inline
                    />
                  </span>
                </th>
                <th
                  @click="cyclePermLevel"
                  class="text-center w-40 lg:w-60 cursor-pointer hover:bg-grayscale-100 active:bg-grayscale-200"
                >
                  <span class="flex gap-2 items-center justify-center">
                    {{ permFilter ?? "Permissions" }}
                    <Icon v-show="permFilter" icon="bx:filter-alt" inline />
                  </span>
                </th>
                <th class="w-20 lg:w-30">&nbsp;</th>
              </tr>
            </thead>
            <tbody class="font-poppins font-regular">
              <UserRow
                v-for="user in filteredUsers"
                :key="user.id"
                :user="user"
              />
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-else-if="!loading && filteredUsers.length === 0"
        class="flex items-center justify-center font-poppins font-medium text-grayscale-700 bg-white pb-4 rounded-b"
      >
        No users match your search query
      </div>
      <div
        v-else-if="loading"
        class="flex items-center justify-center bg-white pb-4 rounded-b"
      >
        <Spinner :size="30" class="fill-primary-500" />
      </div>
      <div v-show="editedUsers.size > 0" class="flex justify-end gap-2 mt-4">
        <Button @click="handleSaveChanges" type="success">
          {{
            `Save ${editedUsers.size} change${editedUsers.size > 1 ? "s" : ""}`
          }}
        </Button>
        <Button @click="handleCancelAll" type="danger">Undo all</Button>
      </div>
    </div>

    <div class="w-full">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import axiosInstance from "../scripts/axiosConfig";
import { useUserStore } from "../stores/userStore";
import { useUsers } from "../scripts/useUsers";
import { useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import type { PermissionLevel, UserWithCount } from "../types/user";
import UserRow from "../components/UserRow.vue";
import Footer from "../components/Footer.vue";
import Spinner from "../components/Spinner.vue";
import Button from "../components/Button.vue";
import { useTailwindBreakpoints } from "../scripts/useTailwindBreakpoints";
import UserRowMobile from "../components/UserRowMobile.vue";
import { useDebounceFn } from "@vueuse/core";
import { Icon } from "@iconify/vue";

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
const debouncedSearchQuery = ref("");
const permFilter = ref<PermissionLevel | null>(null);
const permLevels: (PermissionLevel | null)[] = [
  null,
  "RESTRICTED",
  "STANDARD",
  "FULL",
  "ADMIN",
];
const sortField = ref<"name" | "casId" | "models" | null>("name");
const sortDirection = ref<"asc" | "desc">("asc");

const debouncedSearch = useDebounceFn((query) => {
  debouncedSearchQuery.value = query;
}, 250);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

const toggleSort = (field: "name" | "casId" | "models") => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
};

const cyclePermLevel = () => {
  const currentIndex = permLevels.indexOf(permFilter.value);
  const nextIndex = (currentIndex + 1) % permLevels.length;
  permFilter.value = permLevels[nextIndex];
};

const filteredUsers = computed(() => {
  let filtered = users.value.filter(
    (user) =>
      user.displayName
        ?.toLowerCase()
        .includes(debouncedSearchQuery.value.toLowerCase()) ||
      user.casId.includes(debouncedSearchQuery.value.toLowerCase()),
  );

  if (sortField.value) {
    filtered.sort((a, b) => {
      switch (sortField.value) {
        case "name": {
          const aVal = a.displayName?.toLowerCase() || "";
          const bVal = b.displayName?.toLowerCase() || "";
          if (aVal < bVal) return sortDirection.value === "asc" ? -1 : 1;
          if (aVal > bVal) return sortDirection.value === "asc" ? 1 : -1;
          return 0;
        }
        case "casId": {
          const aVal = a.casId.toLowerCase();
          const bVal = b.casId.toLowerCase();
          if (aVal < bVal) return sortDirection.value === "asc" ? -1 : 1;
          if (aVal > bVal) return sortDirection.value === "asc" ? 1 : -1;
          return 0;
        }
        case "models": {
          const aVal = a._count.models;
          const bVal = b._count.models;
          return sortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
        }
        default:
          return 0;
      }
    });
  }

  if (permFilter.value) {
    filtered = filtered.filter((user) => user.permissions === permFilter.value);
  }

  return filtered;
});

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
