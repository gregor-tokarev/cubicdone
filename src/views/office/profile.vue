<script setup lang="ts">
import AvatarInput from "@components/UI/AvatarInput.vue";
import BaseInput from "@components/UI/BaseInput.vue";
import { reactive, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { email, helpers, required, url } from "@vuelidate/validators";
import { useClerk, useUser } from "vue-clerk";

const { user } = useUser();

const formState = reactive({
  avatarUrl: user.value?.imageUrl,
  displayedName: user.value?.primaryEmailAddress?.emailAddress ?? "",
  email: user.value?.fullName ?? "",
});

const v$ = useVuelidate(
  {
    avatarUrl: { url: url },
    displayedName: { required: helpers.withMessage("Required", required) },
    email: {
      required: helpers.withMessage("Required", required),
      email: helpers.withMessage("It's seems like not email", email),
    },
  },
  formState,
);

const { user: userRes } = useClerk();
console.log(userRes?.createEmailAddress(""));
// console.log(buildUserProfileUrl());
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
        <p class="text-[20px] text-gray-700">Displayed name</p>
        <BaseInput
          class="min-w-[260px]"
          v-model="v$.displayedName.$model"
        ></BaseInput>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-150 py-5"
      >
        <p class="text-[20px] text-gray-700">Email</p>
        <BaseInput class="min-w-[260px]" v-model="v$.email.$model"></BaseInput>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
