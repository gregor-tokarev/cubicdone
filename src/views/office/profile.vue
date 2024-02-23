<script setup lang="ts">
import AvatarInput from "@components/UI/AvatarInput.vue";
import BaseInput from "@components/UI/BaseInput.vue";
import { reactive } from "vue";
import useVuelidate from "@vuelidate/core";
import { email, helpers, required, url } from "@vuelidate/validators";

const formState = reactive({
  avatarUrl: "src/assets/img/gregor.png",
  displayedName: "Egor",
  email: "e@tokarev.work",
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
</script>

<template>
  <div class="pt-[90px]">
    <h1 class="text-[32px]">Account Settings</h1>
    <div class="space-y-10">
      <div
        class="flex items-center justify-between border-b border-gray-150 py-5"
      >
        <p class="text-[20px] text-gray-700">Avatar</p>
        <AvatarInput v-model="v$.avatarUrl.$model"></AvatarInput>
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
