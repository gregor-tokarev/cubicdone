import { ExpoRoot } from "expo-router";
import { AppRegistry } from "react-native";
import { expo } from "./app.json";

// Must be exported or Fast Refresh won't update the context
export function App() {
  // @ts-ignore
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

AppRegistry.registerComponent(expo.name, () => App);
