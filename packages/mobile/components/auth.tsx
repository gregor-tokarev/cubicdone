import { Pressable, Text, View } from "react-native";
import { useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { useOAuth, UseOAuthFlowParams } from "@clerk/clerk-expo";
import GoogleIcon from "../assets/icons/google.svg";
import NotionIcon from "../assets/icons/notion.svg";
import LinearIcon from "../assets/icons/linear.svg";

export function Auth() {
  useEffect(() => {
    void WebBrowser.warmUpAsync();

    return () => {
      void WebBrowser.coolDownAsync();
    };
  });

  const onPress = useCallback(
    async (strategy: UseOAuthFlowParams["strategy"]) => {
      const { startOAuthFlow } = useOAuth({ strategy });

      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    },
    [],
  );

  return (
    <View className="align-center flex-1 justify-center space-y-2.5 px-2.5">
      <Pressable
        onPress={onPress("oauth_google")}
        className="flex-row items-center justify-center space-x-2 rounded border border-gray-400 py-2 text-gray-800"
      >
        <GoogleIcon />
        <Text className="text-center font-[Poppins] text-xl text-gray-800">
          Continue with Google
        </Text>
      </Pressable>
      <Pressable
        onPress={onPress("oauth_notion")}
        className="flex-row items-center justify-center space-x-2 rounded border border-gray-400 py-2 text-gray-800"
      >
        <NotionIcon />
        <Text className="text-center font-[Poppins] text-xl text-gray-800">
          Continue with Notion
        </Text>
      </Pressable>
      <Pressable
        onPress={onPress("oauth_linear")}
        className="flex-row items-center justify-center space-x-2 rounded border border-gray-400 py-2 text-gray-800"
      >
        <LinearIcon />
        <Text className="text-center font-[Poppins] text-xl text-gray-800">
          Continue with Linear
        </Text>
      </Pressable>
    </View>
  );
}
