import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import React from "react";

export default function App() {
  return <Index></Index>;
}

function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-red-400">
        Open up App.tsx to start working on your app!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
