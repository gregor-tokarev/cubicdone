<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Icon from "../components/Icon.vue";
import { getCurrentInstance } from "vue";

defineProps<{
    selectedCount: number;
    commands: { name: string; icon: string; emitName: string }[];
}>();

const { emit: $emit } = getCurrentInstance();

const emit = defineEmits<{
    (e: "discard", value: void): void;
}>();

const { t } = useI18n({
    messages: {
        en: {
            selected: "selected",
        },
        ru: {
            selected: "выбрано",
        },
    },
});
</script>

<template>
    <div class="text-gray-150 flex items-center space-x-2.5 rounded-[40px] bg-gray-900 px-[22px] py-2 text-xs">
        <div class="flex h-[30px] cursor-pointer border border-dashed border-gray-700" @click="emit('discard')">
            <span class="self-center px-[15px]">{{ selectedCount }} {{ t("selected") }}</span>
            <div class="flex w-[30px] items-center justify-center border-l border-dashed border-gray-700">
                <Icon class="h-5 w-5" name="discard"></Icon>
            </div>
        </div>
        <div class="h-9 w-[1px] bg-gray-700"></div>
        <!--    <div
      @click="emit('setProject')"
      class="flex h-[30px] cursor-pointer items-center space-x-1 border border-gray-700 px-2.5"
    >
      <span>#</span>
      <span>set project</span>
    </div>-->
        <div v-for="command in commands" :key="command.name" @click="$emit(command.emitName)"
            class="flex h-[30px] cursor-pointer items-center space-x-1 border border-gray-700 px-2.5">
            <Icon :name="command.icon"></Icon>
            <span>{{ command.name }}</span>
        </div>
    </div>
</template>

<style scoped></style>
