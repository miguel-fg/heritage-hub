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
    <td class="text-center">
      <v-select
        v-model="selectedPermission"
        :options="permissionOptions"
        :noDrop="!editMode"
        :clearable="false"
        class="permission-chooser"
        :class="optionClass(selectedPermission)"
        append-to-body
      >
      </v-select>
    </td>
    <td>
      <button
        @click="toggleEditMode"
        v-if="canEdit"
        class="cursor-pointer flex items-center mx-auto"
        :title="editMode ? 'Undo' : 'Edit'"
      >
        <span class="sr-only">{{ editMode ? "Undo" : "Edit" }}</span>
        <span
          v-show="!editMode"
          class="px-4 text-grayscale-600 hover:text-grayscale-900"
        >
          <Icon icon="bx:edit" width="24" />
        </span>
        <span
          v-show="editMode"
          class="px-4 text-danger-600 hover:text-danger-800"
        >
          <Icon icon="bx:undo" width="24" />
        </span>
      </button>
    </td>
  </tr>
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
