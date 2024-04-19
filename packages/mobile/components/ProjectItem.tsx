import { Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

interface Props {
  checked: boolean;
}

export function ProjectItem(props: Props) {
  return (
    <View className="flex-row items-center justify-between p-3">
      <View className="flex-row items-center space-x-1">
        <View className="h-[11px] w-[11px] rounded-full bg-[#FBB80A]"></View>
        <Text className="text-xs text-[Poppins500] text-black">
          personal_todo
        </Text>
      </View>
      {props.checked && <RemixIcon name="check-line" size={14}></RemixIcon>}
    </View>
  );
}
