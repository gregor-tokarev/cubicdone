<script setup lang="ts">
import AvatarInput from "@components/UI/AvatarInput.vue";
import BaseInput from "@components/UI/BaseInput.vue";
import { computed, reactive, ref, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { email, helpers, required, url } from "@vuelidate/validators";
import { animate } from "motion";
import UpdateProfile from "@components/UpdateProfile.vue";
import { useUserStore } from "@store/user.ts";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const user = computed(() => userStore.user);

const { t } = useI18n({
    messages: {
        en: {
            title: "Account Settings",
            label: {
                avatar: "Avatar",
                email: "Email",
                firstName: "First Name",
                lastName: "Last Name"
            }
        },
        ru: {
            title: "Настройки аккаунта",
            label: {
                avatar: "Аватарка",
                email: "Email",
                firstName: "Имя",
                lastName: "Фамилия"
            }
        }
    }
})

const formState = reactive({
    avatarUrl: user.value?.avatar ?? "",
    email: user.value?.email ?? "",
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

const root = ref<HTMLElement | null>(null);
const containerBound = computed(() => {
    if (!root.value) return;

    return root.value.getBoundingClientRect();
});

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
        await userStore.update({
            firstName: v$.value.firstName.$model,
            lastName: v$.value.lastName.$model,
        });
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <div ref="root" class="pt-[90px]">
        <h1 class="text-[32px]">{{ t("title") }}</h1>
        <div class="space-y-10">
            <div class="border-gray-150 flex items-center justify-between border-b py-5">
                <p class="text-[20px] text-gray-700">{{ t("label.avatar") }}</p>
                <AvatarInput disabled v-model="v$.avatarUrl.$model"></AvatarInput>
            </div>
            <div class="border-gray-150 flex items-center justify-between border-b py-5">
                <p class="text-[20px] text-gray-700">{{ t("label.email") }}</p>
                <BaseInput disabled class="min-w-[260px]" v-model="v$.email.$model"></BaseInput>
            </div>
            <div class="border-gray-150 flex items-center justify-between border-b py-5">
                <p class="text-[20px] text-gray-700">{{ t("label.firstName") }}</p>
                <BaseInput class="min-w-[260px]" :disabled="saving" v-model="v$.firstName.$model"></BaseInput>
            </div>
            <div class="border-gray-150 flex items-center justify-between border-b py-5">
                <p class="text-[20px] text-gray-700">{{ t("label.lastName") }}</p>
                <BaseInput class="min-w-[260px]" :disabled="saving" v-model="v$.lastName.$model"></BaseInput>
            </div>
        </div>
    </div>
    <teleport to="body">
        <UpdateProfile v-if="containerBound" ref="updateBadgeEl" :loading="saving" @save="onSave()"
            class="absolute bottom-0" :style="{
                left: `${containerBound.left}px`,
                width: `${containerBound.width}px`,
            }"></UpdateProfile>
    </teleport>
</template>

<style scoped></style>
