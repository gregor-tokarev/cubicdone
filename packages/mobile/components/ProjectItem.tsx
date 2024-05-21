import { Text, View } from "react-native";
import { Project } from "contract-models";
import RemixIcon from "react-native-remix-icon";

interface Props {
  checked: boolean;
  project: Project;
}

export function ProjectItem(props: Props) {
  return (
    <View className="flex-row items-center justify-between p-3">
      <View className="flex-row items-center space-x-1">
        <View className="h-[11px] w-[11px] rounded-full bg-[#FBB80A]"></View>
        <Text className="text-xs text-[Poppins500] text-black">
          {props.project.title}
        </Text>
      </View>
      {props.checked && <RemixIcon name="check-line" size={14}></RemixIcon>}
    </View>
  );
}
