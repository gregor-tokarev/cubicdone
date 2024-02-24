<script setup lang="ts">
import AuthButton from "@components/UI/AuthButton.vue";
import Icon from "../../components/Icon.vue";
import { useSignUp } from "vue-clerk";
import { OAuthStrategy } from "@clerk/types/dist/strategies";

const { signUp } = useSignUp();

async function onSignup(strategy: OAuthStrategy) {
  if (!signUp.value) return;

  const redirectUrl = import.meta.env.DEV
    ? `${import.meta.env.VITE_BASE_DEV_URL}/inbox`
    : `${import.meta.env.VITE_BASE_URL}/inbox`;

  const res = await signUp.value.create({
    strategy,
    redirectUrl,
    actionCompleteRedirectUrl: redirectUrl,
  });

  const oauthLink =
    res.verifications.externalAccount.externalVerificationRedirectURL;
  if (!oauthLink) return;

  location.href = oauthLink.href;
}
</script>

<template>
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <h1 class="mb-[30px] text-center text-[32px] text-gray-800">
      Login in to personal_todo
    </h1>
    <div class="space-y-4">
      <AuthButton @click="onSignup('oauth_google')">
        <Icon name="google"></Icon>
        <span>Continue with google</span>
      </AuthButton>
      <AuthButton @click="onSignup('oauth_notion')">
        <Icon name="notion"></Icon>
        <span>Continue with notion</span></AuthButton
      >
      <AuthButton @click="onSignup('oauth_linear')">
        <Icon name="linear"></Icon>
        <span>Continue with linear</span></AuthButton
      >
    </div>
  </div>
</template>
