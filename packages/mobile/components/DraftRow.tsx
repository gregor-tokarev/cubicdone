import { Draft } from "contract-models";
import { Text, View } from "react-native";
import { useProjectStore } from "../store/project.store";
import dayjs from "dayjs";

interface Props {
  draft: Draft;
}

export default function DraftRow(props: Props) {
  const project = useProjectStore((state) =>
    state.projects.find((p) => p.id === props.draft.projectId),
  );

  return (
    <View className="flex-row flex-wrap justify-between border-b border-gray-200 p-2.5">
      <View className="flex-row gap-2.5">
        <Text className="whitespace-pre-wrap">{props.draft.title}</Text>
        <Text className="text-gray-600">
          {dayjs(props.draft.dateCreated).format("DD MMM, hh:mm")}
        </Text>
      </View>
      {project && (
        <Text
          className={`rounded-md bg-${project.color}-50 px-[3px] py-0.5 text-${project.color}-400`}
        >
          #{project?.title}
        </Text>
      )}
    </View>
  );
}
