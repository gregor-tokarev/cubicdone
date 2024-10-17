<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import { useTaskStore } from "@store/task.ts";
import { Draft, Task } from "contract-models";
import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
import PlanColumn from "@components/layout/plan/PlanColumn.vue";
import { VueSpinner } from "vue3-spinners";

// @ts-ignore
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import hotkeys from "hotkeys-js";
import { useI18n } from "vue-i18n";
import { nanoid } from "nanoid";
import ContextMenu from "@components/ContextMenu.vue";
import { useProjectModalStore } from "@store/select-modal";

const props = defineProps<{
    integrationDrafts: Draft[];
}>();

const emit = defineEmits<{
    (e: "update:integrationDrafts", value: Draft[]): void;
}>();

const taskStore = useTaskStore();

// Initial Day columns generation
const INITIAL_COLUMNS_COUNT = 30;
const COLUMNS_PER_PAGE = 30;

const initialDayColumns = [];
for (let i = -(INITIAL_COLUMNS_COUNT / 2); i < INITIAL_COLUMNS_COUNT / 2; i++) {
    initialDayColumns.push(dayjs().add(i, "day"));
}
const dayColumns = ref<Dayjs[]>(initialDayColumns);

const todayIndex = computed(() => {
    return dayColumns.value.findIndex((date) => {
        return dayjs().isSame(date, "day");
    });
});
// End of initial Day colum generation

const columnComponents = ref<InstanceType<typeof PlanColumn>[]>([]);
const columnsRoot = ref<InstanceType<typeof RecycleScroller> | null>(null);

async function onScroll(_evt: Event) {
    const scroll: { start: number; end: number } = columnsRoot.value.getScroll();
    const totalSize: number = columnsRoot.value.totalSize;

    if (scroll.end === totalSize) {
        await loadAfterColumns();
    } else if (scroll.start === 0) {
        await loadBeforeColumns();

        setTimeout(() => {
            const newSize: number = columnsRoot.value.totalSize;

            columnsRoot.value.scrollToPosition(newSize - totalSize);
        });
    }
}

const loadingColumns = ref(false);
async function loadBeforeColumns() {
    const newColumns = [];

    loadingColumns.value = true;

    for (let i = 1; i < COLUMNS_PER_PAGE + 1; i++) {
        newColumns.push(dayColumns.value[0].add(-i, "day"));
    }

    await taskStore.paginateOver(newColumns[0].format());
    loadingColumns.value = false;

    dayColumns.value = newColumns.reverse().concat(dayColumns.value);
}
async function loadAfterColumns() {
    const newColumns = [];

    for (let i = 1; i < COLUMNS_PER_PAGE + 1; i++) {
        newColumns.push(
            dayColumns.value[dayColumns.value.length - 1].add(i, "day"),
        );
    }

    dayColumns.value = dayColumns.value.concat(newColumns);
}

onMounted(async () => {
    setTimeout(() => {
        columnsRoot.value?.scrollToItem(INITIAL_COLUMNS_COUNT / 2);
    });

    hotkeys(".", () => {
        onIndexArrows("incr");
    });

    hotkeys(",", () => {
        onIndexArrows("decr");
    });

    hotkeys("t", () => {
        onToday();
    });
});

onUnmounted(() => {
    hotkeys.unbind(",");
    hotkeys.unbind(".");
});

function onMove([date, evt]: [Dayjs, any]) {
    if ("added" in evt) {
        const item = evt["added"].element;

        if ("dateTodo" in item) {
            const task = item as Task;
            taskStore.changeTodoDate(
                task.id,
                date.toISOString(),
                evt["added"].newIndex,
            );
        } else {
            const draft = item as Draft;

            if (!draft.external) {
                taskStore.commitDraft(
                    draft.id,
                    date.toISOString(),
                    evt["added"].newIndex,
                );
            } else {
                taskStore.commitIntegration(
                    draft,
                    date.toISOString(),
                    evt["added"].newIndex,
                );

                const integrationIdx = props.integrationDrafts.findIndex(
                    (d) => d.id === draft.id,
                );

                const tempIntegrations = JSON.parse(
                    JSON.stringify(props.integrationDrafts),
                );
                tempIntegrations.splice(integrationIdx, 1);

                emit("update:integrationDrafts", tempIntegrations);
            }
        }
    } else if ("moved" in evt) {
        const item = evt["moved"].element;

        const oldIdx = evt["moved"].oldIndex;
        const newIdx = evt["moved"].newIndex;

        taskStore.changeOrder(item.id, oldIdx, newIdx);
    }
}

function onToday() {
    if (!columnsRoot.value) return;

    columnsRoot.value.scrollToItem(todayIndex.value);
}

function onIndexArrows(direction: "incr" | "decr") {
    if (!columnsRoot.value) return;

    columnsRoot.value.scrollToItem(
        direction === "incr" ? currentIdx.value : currentIdx.value - 2,
    );
}

const currentIdx = ref(0);
function onUpdate(_1: unknown, _2: unknown, _3: unknown, currIdx: number) {
    currentIdx.value = currIdx;
}

const { t } = useI18n({
    messages: {
        en: {
            today: "Today",
        },
        ru: {
            today: "Сегодня",
        },
    },
});

const hoveredTaskId = ref<string | null>(null)
const contextMenuOpen = ref(false)
watchEffect(() => {
    if (!contextMenuOpen.value) hoveredTaskId.value = null
})

const clickX = ref(0)
const clickY = ref(0)

function onContexMenuOpen(evt: PointerEvent) {
    clickX.value = evt.clientX
    clickY.value = evt.clientY

    contextMenuOpen.value = true
}

function onContextMenuSelect(action: string) {
    if (action === "del") onDeleteTask()
    else if (action === "proj") onSetProject()

    contextMenuOpen.value = false
}


function onListLeave() {
    if (!contextMenuOpen.value) {
        hoveredTaskId.value = null;
    }
}

async function onDeleteTask() {
    if (hoveredTaskId.value)
        taskStore.remove(hoveredTaskId.value)
}

const projectModalStore = useProjectModalStore()
async function onSetProject() {
    if (hoveredTaskId.value) {
        const task = taskStore.getOne(hoveredTaskId.value)
        if (!task) return;

        const projectId = await projectModalStore.use({ item: task, hintText: task.title })

        taskStore.setProject(task.id, projectId)
    }
}

</script>

<template>
    <div class="space-y-3">
        <div class="flex space-x-1.5">
            <!-- <div class="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-gray-100"
                @click="onIndexArrows('decr')" v-hint="','">
            < </div> -->
            <div @click="onToday()" class="flex h-6 cursor-pointer items-center rounded bg-gray-100 px-2.5 text-[12px]"
                v-hint="'T'">
                {{ t("today") }}
            </div>
            <!-- <div class="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-gray-100"
                @click="onIndexArrows('incr')" v-hint="'.'">
                >
            </div> -->
        </div>
        <RecycleScroller class="h-full" ref="columnsRoot" :items="dayColumns" :item-size="320" key-field="$d"
            direction="horizontal" emit-update @update="onUpdate" @scroll="onScroll" @mouseleave="onListLeave">
            <template #before>
                <div v-if="loadingColumns" class="flex h-full w-[50px] items-center justify-center text-gray-600">
                    <VueSpinner></VueSpinner>
                </div>
            </template>
            <template v-slot="{ item }">
                <PlanColumn ref="columnComponents" :date="item" @move="onMove" class="h-full w-[310px] pr-2.5" @hoverTask="hoveredTaskId = $event" @contextmenu.prevent="onContexMenuOpen" :hoveredTask="hoveredTaskId" >
                </PlanColumn>
            </template>
        </RecycleScroller>
    <teleport to="body">
        <ContextMenu ref="contextMenuEl" v-model:show="contextMenuOpen" :options="[
            { id: nanoid(3), label: t('delete'), kbd: '⌘ ⌫', value: 'del' },
            { id: nanoid(3), label: t('setProject'), kbd: '⇧ P', value: 'proj' },
        ]" class="absolute" :style="{
            top: `${clickY}px`,
            left: `${clickX}px`,
        }" @option="onContextMenuSelect"></ContextMenu>
    </teleport>
    </div>
</template>

<style scoped></style>
