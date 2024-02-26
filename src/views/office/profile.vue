<script setup lang="ts">
import AvatarInput from "@components/UI/AvatarInput.vue";
import BaseInput from "@components/UI/BaseInput.vue";
import { computed, reactive, ref, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { email, helpers, required, url } from "@vuelidate/validators";
import { useUser } from "vue-clerk";
import { animate } from "motion";
import UpdateProfile from "@components/UpdateProfile.vue";

const { user } = useUser();

const formState = reactive({
  avatarUrl: user.value?.imageUrl ?? "",
  email: user.value?.primaryEmailAddress?.emailAddress ?? "",
  firstName: user.value?.firstName ?? "",
  lastName: user.value?.lastName ?? "",
});

const v$ = useVuelidate(
  {
    avatarUrl: { url: url },
    firstName: { required: helpers.withMessage("Required", required) },
    lastName: { required: helpers.withMessage("Required", required) },
    email: {
      required: helpers.withMessage("Required", required),
      email: helpers.withMessage("It's seems like not email", email),
    },
  },
  formState,
);

const updateBadgeEl = ref<InstanceType<typeof UpdateProfile> | null>(null);
const hasChanges = computed(() => {
  return (
    formState.firstName !== user.value?.firstName ||
    formState.lastName !== user.value?.lastName
  );
});
watch(hasChanges, (value) => {
  if (!updateBadgeEl.value) return;

  if (value) {
    animate(updateBadgeEl.value.$el, {
      transform: "translateY(-24px)",
    });
  } else {
    animate(updateBadgeEl.value.$el, {
      transform: "translateY(100%)",
    });
  }
});

const saving = ref(false);
async function onSave() {
  if (v$.value.$error) return;

  saving.value = true;

  try {
    await user.value?.update({
      firstName: v$.value.firstName.$model,
      lastName: v$.value.lastName.$model,
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="pt-[90px]">
    <h1 class="text-[32px]">Account Settings</h1>
    <div class="space-y-10">
      <div
        class="flex items-center justify-between border-b border-gray-150 py-5"
      >
        <p class="text-[20px] text-gray-700">Avatar</p>
        <AvatarInput disabled v-model="v$.avatarUrl.$model"></AvatarInput>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-150 py-5"
      >
        <p class="text-[20px] text-gray-700">Email</p>
        <BaseInput
          disabled
          class="min-w-[260px]"
          v-model="v$.email.$model"
        ></BaseInput>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-150 py-5"
      >
        <p class="text-[20px] text-gray-700">First Name</p>
        <BaseInput
          class="min-w-[260px]"
          :disabled="saving"
          v-model="v$.firstName.$model"
        ></BaseInput>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-150 py-5"
      >
        <p class="text-[20px] text-gray-700">Last Name</p>
        <BaseInput
          class="min-w-[260px]"
          :disabled="saving"
          v-model="v$.lastName.$model"
        ></BaseInput>
      </div>
    </div>
    <UpdateProfile
      ref="updateBadgeEl"
      :loading="saving"
      @save="onSave()"
      class="absolute bottom-0 left-0 right-0"
    ></UpdateProfile>
  </div>
</template>

<style scoped></style>
