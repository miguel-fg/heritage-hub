<template>
  <tr :class="!editMode ? 'hover:bg-grayscale-100' : ''">
    <td>
      <p v-if="!editMode" class="text-nowrap w-full">
        {{ props.user.displayName }}
      </p>
      <input
        v-else
        type="text"
        v-model="nameInput"
        class="w-3/4 px-2 py-1 rounded border border-grayscale-500 bg-grayscale-100"
      />
    </td>
    <td>{{ props.user.casId }}</td>
    <td class="text-center">{{ props.user._count.models }}</td>
    <td>
      <div
        class="flex items-center relative w-full rounded-t"
        :class="showPermissions ? 'shadow' : ''"
      >
        <div
          class="flex-1 rounded-full border max-w-40 font-medium text-center mx-auto"
          :class="optionClass(selectedPermission)"
        >
          {{ selectedPermission }}
        </div>
        <button
          @click="toggleShowPermissions"
          v-show="editMode"
          :disabled="!editMode"
          class="hover:cursor-pointer absolute right-0 px-2"
        >
          <ChevronIcon />
        </button>
        <!-- Option dropdown select -->
        <div
          v-show="showPermissions"
          class="absolute z-50 top-full flex flex-col gap-3 w-full py-4 bg-white shadow rounded-b"
        >
          <div
            v-for="option in permissionOptions"
            @click="handlePermissionChange(option)"
            class="py-1 w-full font-medium text-center mx-auto hover:cursor-pointer hover:bg-grayscale-100"
          >
            <div
              class="w-full rounded-full border max-w-40 mx-auto"
              :class="optionClass(option)"
            >
              {{ option }}
            </div>
          </div>
        </div>
      </div>
    </td>
    <td class="flex justify-center">
      <Button
        @click="toggleEditMode"
        v-show="canEdit"
        :type="editMode ? 'danger' : 'secondary'"
        :disabled="!canEdit"
      >
        {{ editMode ? "Cancel" : "Edit" }}
      </Button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useUserStore } from "../stores/userStore";
import { useUsers } from "../scripts/useUsers";
import type { PermissionLevel, UserWithCount } from "../types/user";
import Button from "./Button.vue";
import ChevronIcon from "./icons/ChevronIcon.vue";

const props = defineProps<{
  user: UserWithCount;
}>();

const editMode = ref(false);
const nameInput = ref(props.user.displayName || "");

const showPermissions = ref(false);
const selectedPermission = ref(props.user.permissions);

const optionClass = (option: PermissionLevel) => {
  switch (option) {
    case "RESTRICTED":
      return "bg-danger-100 text-danger-800 border-danger-500";
    case "STANDARD":
      return "bg-info-100 text-info-800 border-info-500";
    case "FULL":
      return "bg-success-100 text-success-800 border-success-500";
    case "ADMIN":
      return "bg-grayscale-100 text-grayscale-800 border-grayscale-500";
  }
};

const userStore = useUserStore();
const { addEditedUser, removeEditedUser, resetCounter } = useUsers();

const toggleEditMode = async () => {
  if (editMode.value) {
    nameInput.value = props.user.displayName || "";
    selectedPermission.value = props.user.permissions;
    await nextTick();
    removeEditedUser(props.user.id);
  }
  editMode.value = !editMode.value;
};

const toggleShowPermissions = () => {
  showPermissions.value = !showPermissions.value;
};

const permissions: PermissionLevel[] = [
  "RESTRICTED",
  "STANDARD",
  "FULL",
  "ADMIN",
];

const permissionOptions = computed(() =>
  permissions.filter((p) => p !== selectedPermission.value),
);

const canEdit = computed(() => userStore.user!.id !== props.user.id);

const handlePermissionChange = (newPermission: PermissionLevel) => {
  selectedPermission.value = newPermission;
  showPermissions.value = false;
};

watch([nameInput, selectedPermission], () => {
  if (
    nameInput.value !== props.user.displayName ||
    selectedPermission.value !== props.user.permissions
  ) {
    addEditedUser(props.user.id, nameInput.value, selectedPermission.value);
  }
});

watch(resetCounter, () => {
  nameInput.value = props.user.displayName || "";
  selectedPermission.value = props.user.permissions;
  editMode.value = false;
  showPermissions.value = false;
});
</script>
