import { SafeAreaView, Text, View } from "react-native";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

export default function Root() {
  const [fontLoaded, _fontError] = useFonts({
    Poppins300: require("../assets/font/poppins-v21-latin-300.ttf"),
    Poppins: require("../assets/font/poppins-v21-latin-regular.ttf"),
    Poppins500: require("../assets/font/poppins-v21-latin-500.ttf"),
    Poppins600: require("../assets/font/poppins-v21-latin-600.ttf"),
    Poppins700: require("../assets/font/poppins-v21-latin-700.ttf"),
  });

  if (!fontLoaded) return <Text>Loading...</Text>;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="h-[35px] justify-center border-b border-gray-200">
          <Text className="text-center font-[Poppins300] text-xl">TODO</Text>
        </View>
        <Slot></Slot>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
