<script setup lang="ts">
import Markdown from "@components/Markdown.vue";
import Checkbox from "@components/UI/Checkbox.vue";
import { setCursorPosition } from "@utils/focus.ts";
import { replaceAt } from "@utils/replaceAt.ts";
import { onClickOutside, useDebounceFn } from "@vueuse/core";
import { Draft } from "contract-models";
import dayjs from "dayjs";
import { ref, watch } from "vue";
import ProjectTag from "../UI/ProjectTag.vue";

const props = defineProps<{
    draft: Draft;
    selected: boolean;
}>();

const emit = defineEmits<{
    (e: "update:title", value: string): void;
    (e: "update:selected", value: boolean): void;
    (e: "remove", value: Draft["id"]): void;
}>();

const editEl = ref<HTMLElement | null>(null);

const mode = ref<"view" | "edit">("view");
watch(mode, (newMode) => {
    if (newMode !== "view") return;

    if (!editEl.value) return;

    const value = editEl.value.textContent;
    value && emit("update:title", value);
});
onClickOutside(editEl, () => {
    mode.value = "view";
});

function editDraft(event: Event) {
    const target = event.target as HTMLElement;
    const value = target.textContent;

    value && emit("update:title", value);
}

const onEditDraft = useDebounceFn(editDraft, 1000);

function onKeydown(evt: KeyboardEvent) {
    if (evt.key === "`") {
        evt.preventDefault();

        const sel = window.getSelection();
        const range = sel?.getRangeAt(0);
        const offset = range?.startOffset;

        if (offset === undefined) return;

        emit("update:title", replaceAt(props.draft.title, offset, "``"));

        setTimeout(() => {
            if (!editEl.value || offset === undefined) return;

            setCursorPosition(editEl.value, offset + 1);
        });
    } else if (evt.key === "Backspace") {
        if (editEl.value?.textContent?.length === 0) {
            evt.preventDefault();
            emit("remove", props.draft.id);
        }
    } else if (evt.key === "Enter") {
        evt.preventDefault();

        if (editEl.value?.textContent?.length === 0) {
            emit("remove", props.draft.id);
            return;
        }

        editDraft(evt);
        editEl.value?.blur();
    }
}
</script>

<template>
    <div class="flex cursor-grab items-center border-b border-gray-400 p-2.5 transition-colors duration-75 hover:bg-gray-50 active:cursor-grabbing"
        :class="{ '!border-black bg-gray-50': selected }">
        <!--    checkbox-->
        <Checkbox :model-value="selected" @update:model-value="emit('update:selected', $event)" class="mr-1.5">
        </Checkbox>
        <div class="flex items-baseline">
            <!--    Title-->
            <div v-if="mode === 'edit'" contenteditable="true" @input="onEditDraft($event)" @keydown="onKeydown($event)"
                @blur="mode = 'view'" ref="editEl" class="cursor-text text-base text-black outline-0">
                {{ draft.title }}
            </div>
            <Markdown v-else-if="mode === 'view'" @click="mode = 'edit'" :model-value="draft.title"></Markdown>
            <div class="ml-2.5 text-xs text-gray-600">
                {{ dayjs(draft.dateCreated).format("D MMM, HH:mm") }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
