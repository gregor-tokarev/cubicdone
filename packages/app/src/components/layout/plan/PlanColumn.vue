<script setup lang="ts">
import TaskCard from "@components/cards/TaskCard.vue";
import { useTaskStore } from "@store/task.ts";
import { Task } from "contract-models";
import dayjs, { Dayjs } from "dayjs";
import { computed } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useI18n } from "vue-i18n";
import 'dayjs/locale/ru'

const props = defineProps<{
    date: Dayjs;
}>();

const emit = defineEmits<{
    (e: "move", value: [Dayjs, any]): void;
}>();

const taskStore = useTaskStore();

async function onUpdateStatus(id: string, status: Task["status"]) {
    taskStore.update(id, { status });
}

const { t } = useI18n({
    messages: {
        en: {
            today: "Today",
            tomorrow: "Tomorrow",
            yesterday: "Yesterday",
            weekday: {
                sunday: "Sunday",
                monday: "Monday",
                tuesday: "Tuesday",
                wednesday: "Wednesday",
                thursday: "Thursday",
                friday: "Friday",
                saturday: "Saturday",
            }
        },
        ru: {
            today: "Сегодня",
            tomorrow: "Завтра",
            yesterday: "Вчера",
            weekday: {
                sunday: "Воскресенье",
                monday: "Понедельник",
                tuesday: "Вторник",
                wednesday: "Среда",
                thursday: "Четверг",
                friday: "Пятница",
                saturday: "Суббота",
            }
        }
    }
})

const dateDescription = computed(() => {
    if (dayjs().isSame(props.date, "d")) return t("today");
    else if (dayjs().add(1, "d").isSame(props.date, "d")) return t("tomorrow");
    else if (dayjs().add(-1, "d").isSame(props.date, "d")) return t("yesterday");
    else
        return [
            t("weekday.sunday"),
            t("weekday.monday"),
            t("weekday.tuesday"),
            t("weekday.wednesday"),
            t("weekday.thursday"),
            t("weekday.friday"),
            t("weekday.saturday"),
        ][props.date.day()];
});
</script>

<template>
    <div ref="root" class="flex flex-col rounded-lg bg-gray-50 px-2.5 py-1.5" :data-date="date">
        <div class="mb-5 text-base text-black">
            {{ dayjs(date).format("DD MMM")
            }}<template v-if="dateDescription">, {{ dateDescription }}</template>
        </div>
        <VueDraggableNext class="grow space-y-2.5 overflow-y-auto overflow-x-hidden"
            @change="emit('move', [date, $event])" :list="taskStore.getByDate(date.toString())"
            :group="{ name: 'tasks' }">
            <TaskCard v-for="t in taskStore.getByDate(date.toString())" :key="t.id" :task="t" data-drag :data-id="t.id"
                @update:status="onUpdateStatus(t.id, $event)"></TaskCard>
        </VueDraggableNext>
    </div>
</template>

<style scoped></style>
