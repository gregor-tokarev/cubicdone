<script setup lang="ts">
import AuthButton from "@components/UI/AuthButton.vue";
import { ref } from "vue";
import Icon from "../../components/Icon.vue";

const opening = ref(false);

async function onSignin(strategy: "google" | "linear") {
  opening.value = true;
  location.href = `https://api.cubicdone.com/oauth/${strategy}`;
}
</script>

<template>
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <h1 class="mb-[30px] text-center text-[32px] text-gray-800">
      Sign In to personal_todo
    </h1>
    <div class="space-y-4">
      <AuthButton @click="onSignin('google')" :disabled="opening">
        <Icon
          v-if="opening"
          name="sync"
          class="animate-spin text-gray-800"
        ></Icon>
        <Icon v-else :size="24" name="google"></Icon>
        <span>Continue with google</span>
      </AuthButton>
      <AuthButton @click="onSignin('linear')" :disabled="opening">
        <Icon
          v-if="opening"
          name="sync"
          class="animate-spin text-gray-800"
        ></Icon>
        <Icon v-else :size="24" name="linear"></Icon>
        <span>Continue with linear</span>
      </AuthButton>
    </div>
  </div>
</template>
