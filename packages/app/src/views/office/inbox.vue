<script setup lang="ts">
import DraftRow from "@components/cards/DraftRow.vue";
import CommandPalette from "@components/CommandPalette.vue";
import ContextMenu from "@components/ContextMenu.vue";
import Icon from "@components/Icon.vue";
import DraftInput from "@components/DraftInput.vue";
import { InputGenericPart } from "@models/input-part.model.ts";
import { useDeleteModalStore } from "@store/delete-modal.ts";
import { useDraftsStore } from "@store/drafts.ts";
import { useProjectStore } from "@store/project.ts";
import { useProjectModalStore } from "@store/select-modal.ts";
import { setScrolling } from "@utils/setScrolling.ts";
import { Draft } from "contract-models";
import hotkeys from "hotkeys-js";
import { animate } from "motion";
import { nanoid } from "nanoid";
import { computed, onMounted, ref, watch } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useI18n } from "vue-i18n";

const draftStore = useDraftsStore();
const projectStore = useProjectStore();

const { t } = useI18n({
    messages: {
        en: {
            delete: "Delete",
            setProject: "Set project",
            deleteModal: {
                multipleDelete: `Are you sure you want to delete {length} drafts?`,
                warning: "Delete would be permanent, you can’t restore issues later.",
                spesificDelete: `Are you sure you want to delete “{title}”?`,
            },
            emptyPlaceholder: `
Write everything on your mind. <br />
            Clear it, to achieve better performance. <br />
            Press Enter after you wrote it.
            `,
        },
        ru: {
            delete: "Удалить",
            setProject: "Выбрать проект",
            deleteModal: {
                multipleDelete: `Вы уверенны, что хотите удалить 0 драфтов? | Вы уверенны, что хотите удалить {length} драфт? | Вы уверенны, что хотите удалить {length} драфта? | Вы уверенны, что хотите удалить {length} драфтов?`,
                warning:
                    "Удаление будет пермонентным, вы не сможете восстановить драфты",
                spesificDelete: `Вы уверены, что хотети удалить “{title}”?`,
            },
            emptyPlaceholder: `
Пишите все дела, что у вас не уме <br />
            Очистив ум вы освободите его для важного <br />
            Просто нажмите Enter после того как вы все написали.
            `,
        },
    },
});

const draftInput = ref<InstanceType<typeof DraftInput> | null>(null);

const prompt = ref<InputGenericPart[]>([
    { type: "text", content: "", id: nanoid(3) },
]);

onMounted(async () => {
    await Promise.all([draftStore.loadDrafts(), projectStore.loadProjects()]);

    hotkeys("cmd+backspace", () => {
        removeDraft();
    });
    hotkeys("shift+p", () => {
        selectProject();
    });
    hotkeys("x,shift+x", () => {
        hoveredDraftId.value && onUpdateSelection(hoveredDraftId.value);
    });
    hotkeys("esc", () => {
        if (selectedDraftIds.value.length) {
            selectedDraftIds.value = [];
        }
    });

    hotkeys("i", (evt) => {
        const sentryEl = document.querySelector("#sentry-feedback");
        if (document.activeElement === sentryEl) return;

        evt.preventDefault();
        draftInput.value && draftInput.value.focusOnCurrentNode();
    });
});

function onCreateDraft() {
    if (!prompt.value || textLength.value > maxPossibleLength) return;

    const text = prompt.value.reduce((acc, p) => {
        if (p.type === "text") {
            acc += p.content;
        }

        return acc;
    }, "");

    const projectPart = prompt.value.find((p) => p.type === "project");

    prompt.value = [{ type: "text", content: "", id: nanoid() }];

    draftStore.create(
        text,
        projectPart && "projectId" in projectPart ? projectPart?.projectId : null,
    );
}

function onEditDraft(id: string, newTitle: string) {
    draftStore.edit(id, newTitle);
}

function onChangeOrder(evt: any) {
    if (evt["moved"]) {
        const item = evt["moved"].element;
        const oldIdx = evt["moved"].oldIndex;
        const newIdx = evt["moved"].newIndex;

        draftStore.changeOrder(item.id, oldIdx, newIdx);
    }
}

const inboxCommandEl = ref<InstanceType<typeof CommandPalette> | null>(null);
const selectedDraftIds = ref<string[]>([]);
watch(
    selectedDraftIds,
    (ids) => {
        if (!inboxCommandEl.value) return;

        if (ids.length > 0) {
            animate(inboxCommandEl.value.$el, {
                transform: "translateY(-50%) translateX(-50%)",
            });
        } else {
            animate(inboxCommandEl.value.$el, {
                transform: "translateY(100%) translateX(-50%)",
            });
        }
    },
    { deep: true },
);

function onUpdateSelection(draftId: string) {
    if (hotkeys.isPressed("shift") && selectedDraftIds.value.length > 0) {
        const draft = draftStore.getOne(draftId);
        if (!draft) return;

        const selectedDrafts = selectedDraftIds.value.map(
            (d) => draftStore.getOne(d)!,
        );
        const selectedOrders = selectedDrafts.map((d) => d.order);

        const minSelectedOrder = Math.min(...selectedOrders);
        const maxSelectedOrder = Math.max(...selectedOrders);

        if (draft.order > maxSelectedOrder) {
            const draftsToAdd = draftStore.drafts.filter(
                (d) => d.order < draft.order && d.order > maxSelectedOrder,
            );

            selectedDraftIds.value = selectedDraftIds.value.concat(
                draftsToAdd.map((d) => d.id),
            );
        } else if (draft.order < minSelectedOrder) {
            const draftsToAdd = draftStore.drafts.filter(
                (d) => d.order > draft.order && d.order < minSelectedOrder,
            );

            selectedDraftIds.value = selectedDraftIds.value.concat(
                draftsToAdd.map((d) => d.id),
            );
        }
    }

    if (selectedDraftIds.value.includes(draftId)) {
        const idx = selectedDraftIds.value.findIndex((did) => did === draftId);
        selectedDraftIds.value.splice(idx, 1);
    } else {
        selectedDraftIds.value.push(draftId);
    }
}

const contextMenuOpen = ref(false);
watch(contextMenuOpen, (value) => {
    if (!value) {
        hoveredDraftId.value = null;
        setScrolling(true);
    }
});
const contextMenuEl = ref<HTMLElement | null>(null);
const listEl = ref<HTMLElement | null>(null);

function onToggleContextMenu(evt: MouseEvent) {
    clickX.value = evt.clientX;
    clickY.value = evt.clientY;

    contextMenuOpen.value = true;
    setScrolling(false);
}

const clickX = ref(0);
const clickY = ref(0);

const hoveredDraftId = ref<string | null>(null);

const projectModalStore = useProjectModalStore();
async function onSelectContextMenu(action: string) {
    if (action === "del") {
        removeDraft();
    } else if (action === "proj") {
        selectProject();
    }

    contextMenuOpen.value = false;
}

const deleteModalStore = useDeleteModalStore();
async function removeDraft() {
    if (selectedDraftIds.value.length) {
        const res = await deleteModalStore.use({
            titleText: t(
                "deleteModal.multipleDelete",
                { length: selectedDraftIds.value.length },
                selectedDraftIds.value.length,
            ),
            descriptionText: t("deleteModal.warning"),
        });
        if (!res) return;

        draftStore.remove(selectedDraftIds.value);
        selectedDraftIds.value = [];

        return;
    }

    const draft = hoveredDraftId.value
        ? draftStore.getOne(hoveredDraftId.value)
        : null;
    if (!draft) return;

    const res = await deleteModalStore.use({
        titleText: t("deleteModal.spesificDelete", {
            title: selectedDraftIds.value.length,
        }),
        descriptionText: t("deleteModal.warning"),
    });

    res && draftStore.remove(draft.id);
}

function selectProject() {
    if (selectedDraftIds.value.length > 0) {
        projectModalStore
            .use({
                hintText: `${selectedDraftIds.value.length} drafts`,
            })
            .then((projectId) => {
                draftStore.setProject(selectedDraftIds.value, projectId);

                selectedDraftIds.value = [];
            });

        return;
    }

    if (!hoveredDraftId.value) return;
    const draft = draftStore.getOne(hoveredDraftId.value);
    if (!draft) return;

    projectModalStore
        .use({
            draft,
            hintText: draft.title,
        })
        .then((projectId) => {
            draftStore.setProject(draft.id, projectId);
        });
}

function onListLeave() {
    if (!contextMenuOpen.value) {
        hoveredDraftId.value = null;
    }
}

// TODO: focus on previous draft after deleting
const draftEls = ref<InstanceType<typeof DraftRow>[]>([]);
function onRemove(id: Draft["id"]) {
    draftStore.remove(id);
}

// Symbol counting
const textLength = computed(() => {
    return prompt.value.reduce((acc, itm) => {
        if (itm.type === "text") {
            return (acc += itm.content.length);
        }

        return acc;
    }, 0);
});
const maxPossibleLength = 100;
</script>

<template>
    <div class="pt-8">
        <div class="relative">
            <DraftInput id="draftinput" ref="draftInput" placeholder="todo text" v-model="prompt"
                @enter="onCreateDraft()" v-hint="'I'">
            </DraftInput>
            <Icon name="help"
                class="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full cursor-pointer text-gray-600"
                v-hint="'Get help'"></Icon>
        </div>
        <div class="pt-1 text-right text-xs text-gray-400" :class="{ 'text-red-400': textLength > maxPossibleLength }">
            {{ textLength }}/{{ maxPossibleLength }}
        </div>
        <!--  drafts list-->
        <VueDraggableNext v-if="draftStore.sortedDrafts.length" ref="listEl" class="mt-5"
            :list="draftStore.sortedDrafts" @change="onChangeOrder" @mouseleave="onListLeave"
            @contextmenu.prevent="onToggleContextMenu">
            <DraftRow :draft="d" v-for="(d, idx) in draftStore.sortedDrafts" :key="idx" ref="draftEls" class="draft-row"
                :class="{ 'bg-gray-50': hoveredDraftId === d.id }" :selected="selectedDraftIds.includes(d.id)"
                @mouseenter="hoveredDraftId = d.id" @update:title="onEditDraft(d.id, $event)"
                @update:selected="onUpdateSelection(d.id)" @remove="onRemove($event)"></DraftRow>
        </VueDraggableNext>
        <p class="mt-10 text-center text-gray-600" v-else v-html="t('emptyPlaceholder')"></p>
    </div>
    <teleport to="body">
        <ContextMenu ref="contextMenuEl" v-model:show="contextMenuOpen" :options="[
            { id: nanoid(3), label: t('delete'), kbd: '⌘ ⌫', value: 'del' },
            { id: nanoid(3), label: t('setProject'), kbd: '⇧ P', value: 'proj' },
        ]" class="absolute" :style="{
        top: `${clickY}px`,
        left: `${clickX}px`,
    }" @option="onSelectContextMenu($event)"></ContextMenu>
    </teleport>
    <CommandPalette ref="inboxCommandEl" class="fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-full" #inboxCommand
        :commands="[
            { name: t('setProject'), icon: 'hashtag', emitName: 'setProject' },
            { name: t('delete'), icon: 'basket', emitName: 'remove' },
        ]" @discard="selectedDraftIds = []" @setProject="selectProject" @remove="removeDraft"></CommandPalette>
</template>
