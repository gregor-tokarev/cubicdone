<script setup lang="ts">
import { useProjectStatusModalStore } from "@store/select-modal.ts";
import { useProjectStatusStore } from "@store/project-status.ts";
import { computed, ref } from "vue";
import SelectModal from "./SelectModal.vue";
import { useI18n } from "vue-i18n";

const projectStatusModalStore = useProjectStatusModalStore();
const projectStatusStore = useProjectStatusStore();

const query = ref("");

const { t } = useI18n({
    messages: {
        en: {
            'not started': "not started",
            "in progress": "in progress",
            'finished': "finished"
        },
        ru: {
            'not started': "Не начат",
            "in progress": "В прогрессе",
            'finished': "Завершен"
        }
    }
})

const projectOptions = computed(() => {
    const searchIndex = projectStatusStore.getIndex;
    const searchResults = searchIndex.search(query.value);

    const result = query.value
        ? searchResults.map((r) => r.item)
        : projectStatusStore.projectStatuses;

    return result.map((project) => ({
        id: project.id,
        text: t(project.title),
        icon: project.icon,
    }));
});

function onSubmit(id: string) {
    projectStatusModalStore.resolveFn && projectStatusModalStore.resolveFn(id);
}

const open = computed({
    get() {
        return projectStatusModalStore.open;
    },
    set(value: boolean) {
        if (!value) {
            projectStatusModalStore.close();
            query.value = "";
        }
    },
});

const checkedIndex = computed(() => {
    return projectOptions.value.findIndex(
        (p) => p.id === projectStatusModalStore.modalOptions?.statusId,
    );
});
</script>

<template>
    <SelectModal v-if="projectStatusModalStore.modalOptions" :hint-text="projectStatusModalStore.modalOptions.hintText"
        :checked-index="checkedIndex" v-model:query="query" :options="projectOptions" v-model:open="open"
        @submit="onSubmit" />
</template>
@store/select-modal
