import { SafeAreaView, Text, View } from "react-native";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Root() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="h-[35px] border-b border-gray-200">
          <Text className="text-center text-xl">TODO</Text>
        </View>
        <Slot></Slot>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
