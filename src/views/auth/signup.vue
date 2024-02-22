<script setup lang="ts">
import AuthButton from "@components/UI/AuthButton.vue";
import Icon from "../../components/Icon.vue";
</script>

<template>
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <h1 class="mb-[30px] text-center text-[32px] text-gray-800">
      Login in to personal_todo
    </h1>
    <div class="space-y-4">
      <AuthButton>
        <Icon name="google"></Icon>
        <span>Continue with google</span>
      </AuthButton>
      <AuthButton>
        <Icon name="notion"></Icon>
        <span>Continue with notion</span></AuthButton
      >
      <AuthButton>
        <Icon name="linear"></Icon>
        <span>Continue with linear</span></AuthButton
      >
    </div>
  </div>
</template>
