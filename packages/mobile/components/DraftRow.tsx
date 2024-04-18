import { Draft } from "contract-models";
import { Text, View } from "react-native";

interface Props {
  draft?: Draft;
}

export default function DraftRow(_props: Props) {
  return (
    <View className="flex-row justify-between border-b border-gray-200 p-2.5">
      <View className="flex-row gap-2.5">
        <Text>Task text</Text>
        <Text className="text-gray-400">12 sept, 12:13</Text>
      </View>
      <Text className="rounded-md bg-pink-50 px-[3px] py-0.5 text-pink-400">
        #procollab
      </Text>
    </View>
  );
}
