<template>
  <div class="space-y-3 bg-white rounded px-3 pt-6 pb-4 sm:px-6 sm:py-6">
    <div class="flex justify-between items-center gap-5">
      <span class="subtitle text-primary-500">Name</span>
      <span
        v-if="!editMode"
        class="font-poppins font-medium text-grayscale-800"
        >{{ props.user.displayName }}</span
      >
      <input
        v-else
        type="text"
        v-model="nameInput"
        class="w-full sm:w-1/2 px-2 py-1 rounded border border-grayscale-500 bg-grayscale-100 font-poppins"
      />
    </div>
    <div class="flex justify-between items-center">
      <span class="subtitle text-primary-500">CAS ID</span>
      <span class="font-poppins font-medium text-grayscale-800">{{
        props.user.casId
      }}</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="subtitle text-primary-500">Models</span>
      <span class="font-poppins font-medium text-grayscale-800">{{
        props.user._count.models
      }}</span>
    </div>
    <div class="flex justify-between items-center gap-5">
      <span class="subtitle text-primary-500">Permissions</span>
      <div class="sm:w-1/2 min-w-35 sm:min-w-40">
        <v-select
          v-model="selectedPermission"
          :options="permissionOptions"
          :noDrop="!editMode"
          :clearable="false"
          class="permission-chooser"
          :class="optionClass(selectedPermission)"
        >
        </v-select>
      </div>
    </div>
    <div class="w-full flex justify-end">
      <button
        @click="toggleEditMode"
        v-if="canEdit"
        :disabled="!canEdit"
        class="font-poppins font-medium flex items-center gap-2 cursor-pointer py-1 px-2 active:bg-grayscale-200"
        :class="editMode ? 'text-danger-600' : 'text-grayscale-800'"
      >
        <Icon :icon="editMode ? 'bx:undo' : 'bx:edit'" width="20" />
        {{ editMode ? "Cancel" : "Edit" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useUserStore } from "../stores/userStore";
import { useUsers } from "../scripts/useUsers";
import type { PermissionLevel, UserWithCount } from "../types/user";
import { Icon } from "@iconify/vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

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
      return "restricted";
    case "STANDARD":
      return "standard";
    case "FULL":
      return "full";
    case "ADMIN":
      return "admin";
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

<style>
.permission-chooser {
  font-family: var(--font-poppins);
  font-weight: 500;
  font-size: 1rem;
}

.permission-chooser .vs__dropdown-toggle {
  border: 1px solid var(--color-grayscale-300);
  border-radius: var(--radius-xs);
}

.permission-chooser .vs__search::placeholder {
  color: var(--color-grayscale-500);
}

.permission-chooser .vs__dropdown-option--highlight {
  background: var(--color-grayscale-100);
  color: var(--color-grayscale-900);
}

.permission-chooser.restricted {
  background: var(--color-danger-100);
}

.permission-chooser.restricted .vs__dropdown-toggle {
  border-color: var(--color-danger-500);
}

.permission-chooser.restricted .vs__selected {
  color: var(--color-danger-800);
}

.permission-chooser.standard {
  background: var(--color-info-100);
}

.permission-chooser.standard .vs__dropdown-toggle {
  border-color: var(--color-info-500);
}

.permission-chooser.standard .vs__selected {
  color: var(--color-info-800);
}
.permission-chooser.full {
  background: var(--color-success-100);
}

.permission-chooser.full .vs__dropdown-toggle {
  border-color: var(--color-success-500);
}

.permission-chooser.full .vs__selected {
  color: var(--color-success-800);
}

.permission-chooser.admin {
  background: var(--color-grayscale-100);
}

.permission-chooser.admin .vs__dropdown-toggle {
  border-color: var(--color-grayscale-500);
}

.permission-chooser.admin .vs__selected {
  color: var(--color-grayscale-800);
}
</style>
