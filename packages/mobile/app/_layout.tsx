import { SafeAreaView, Text, View } from "react-native";
import { Slot } from "expo-router";

export default function Root() {
  return (
    <SafeAreaView>
      <View className="h-[35px] border-b border-gray-200">
        <Text className="text-center text-xl">TODO</Text>
      </View>
      <Slot></Slot>
    </SafeAreaView>
  );
}
