import { Text, TouchableOpacity, View } from "react-native";
import React, { JSX, useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
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

  const googleOAuth = useOAuth({ strategy: "oauth_google" });
  const notionOAuth = useOAuth({ strategy: "oauth_notion" });
  const linearOAuth = useOAuth({ strategy: "oauth_linear" });

  const buttons = [
    {
      strategy: googleOAuth,
      text: "Continue with Google",
      icon: <GoogleIcon />,
    },
    {
      strategy: notionOAuth,
      text: "Continue with Notion",
      icon: <NotionIcon />,
    },
    {
      strategy: linearOAuth,
      text: "Continue with Linear",
      icon: <LinearIcon />,
    },
  ] satisfies {
    strategy: ReturnType<typeof useOAuth>;
    text: string;
    icon: JSX.Element;
  }[];

  const onPress = useCallback(async (strategy: ReturnType<typeof useOAuth>) => {
    const { startOAuthFlow } = strategy;

    const { createdSessionId, setActive } = await startOAuthFlow();

    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
    }
  }, []);

  return (
    <View className="align-center flex-1 justify-center space-y-2.5 px-2.5">
      {buttons.map((item) => (
        <TouchableOpacity
          key={item.text}
          onPress={() => onPress(item.strategy)}
          className="flex-row items-center justify-center space-x-2 rounded border border-gray-400 py-2 text-gray-800"
        >
          {item.icon}
          <Text className="text-center font-[Poppins] text-xl text-gray-800">
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
