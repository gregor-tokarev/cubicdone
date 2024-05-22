import { SafeAreaView, Text, View } from "react-native";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import React from "react";
import { Auth } from "../components/auth";
import * as SecureStore from "expo-secure-store";
import { TrpcProvider } from "../lib/trpcProvider";
import Constants from "expo-constants";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

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
      <ClerkProvider
        publishableKey={Constants.expoConfig?.extra?.clerkKey ?? ""}
        tokenCache={tokenCache}
      >
        <TrpcProvider>
          <SafeAreaView className="flex-1 pt-[55px]">
            <SignedIn>
              <View className="h-[35px] justify-center border-b border-gray-400">
                <Text className="text-center font-[Poppins] text-xl text-gray-800">
                  TODO
                </Text>
              </View>
              <Slot></Slot>
            </SignedIn>
            <SignedOut>
              <View className="h-[35px] justify-center border-b border-gray-400">
                <Text className="text-center font-[Poppins] text-xl text-gray-800">
                  SIGN IN
                </Text>
              </View>
              <Auth></Auth>
            </SignedOut>
          </SafeAreaView>
        </TrpcProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
