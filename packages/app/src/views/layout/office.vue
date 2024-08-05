<script setup lang="ts">
import DeleteModal from "@components/DeleteModal.vue";
import * as flows from "@flows/js"
import ProjectModal from "@components/SelectModals/ProjectModal.vue";
import Sidebar from "@components/Sidebar.vue";
import { useDraftsStore } from "@store/drafts.ts";
import { useIntegrationStore } from "@store/integration.ts";
import { useProjectStatusStore } from "@store/project-status.ts";
import { useProjectStore } from "@store/project.ts";
import { useTaskStore } from "@store/task.ts";
import hotkeys from "hotkeys-js";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { VueSpinnerPuff } from "vue3-spinners";

const router = useRouter();

const integrationStore = useIntegrationStore();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const draftStore = useDraftsStore();
const projectStatusStore = useProjectStatusStore();

const synced = ref(true);
onMounted(async () => {
    flows.init({ projectId: "25afae2c-fee0-4023-af9e-9e1c62d96b0c" })

    hotkeys.filter = (event) => {
        if (event.metaKey) return true;

        const target = event.target as HTMLElement;
        const tagName = target?.tagName;

        return !(
            target.isContentEditable ||
            tagName == "INPUT" ||
            tagName == "SELECT" ||
            tagName == "TEXTAREA"
        );
    };

    // go to inbox page hotkey
    hotkeys("cmd+i", (evt) => {
        evt.preventDefault();
        router.push("/inbox");
    });

    // go to plan page hotkey
    hotkeys("cmd+g", (evt) => {
        evt.preventDefault();
        router.push("/");
    });

    hotkeys("cmd+p", (evt) => {
        evt.preventDefault();
        router.push("/projects");
    });

    hotkeys("cmd+o", (evt) => {
        evt.preventDefault();
        router.push("/profile");
    });

    try {
        await Promise.all([
            integrationStore.backwardSync(),
            taskStore.backwardSync(),
            projectStore.backwardSync(),
            draftStore.backwardSync(),
            projectStatusStore.backwardSync(),
        ]);
        synced.value = true;
    } catch (e) {
        console.log(e);
    }
});
</script>

<template>
    <div v-if="synced" class="flex h-[100vh] items-start">
        <Sidebar class="h-full"></Sidebar>
        <div class="relative h-full grow overflow-y-auto" data-scroll-container>
            <div class="relative mx-auto h-full max-w-[980px]" data-office-wrapper>
                <router-view></router-view>
            </div>
        </div>
    </div>
    <div v-else class="fixed inset-0 flex items-center justify-center bg-white">
        <VueSpinnerPuff size="200px" color="#333"></VueSpinnerPuff>
    </div>
    <ProjectModal></ProjectModal>
    <DeleteModal></DeleteModal>
</template>


<style scoped></style>
