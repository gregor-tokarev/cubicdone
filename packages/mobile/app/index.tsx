import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import DraftRow from "../components/DraftRow";
import RemixIcon from "react-native-remix-icon";
import { useState } from "react";

export default function Page() {
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <View className="relative flex-1">
      {false ? (
        <FlatList
          className="pt-10"
          data={Array(10)}
          renderItem={(_item) => <DraftRow></DraftRow>}
        ></FlatList>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="max-w-[260px] -translate-x-1/2 text-center text-sm text-gray-400">
            Write everything on your mind. Clear it, to achieve better
            performance
          </Text>
        </View>
      )}

      <Pressable
        className="absolute bottom-5 right-5 h-11 w-11 items-center justify-center rounded-md bg-black"
        onPress={() => setEditModalOpen(true)}
      >
        <RemixIcon name="add-line" color="white"></RemixIcon>
      </Pressable>
      <Modal
        visible={editModalOpen}
        className="bg-sky-400"
        transparent
        statusBarTranslucent
        onRequestClose={() => setEditModalOpen(false)}
        animationType="fade"
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="mt-auto bg-white pb-2">
            <TextInput
              autoFocus={true}
              placeholder="Task point"
              className="block w-full border-b border-gray-300 p-2.5"
            ></TextInput>
            <View className="mt-4 flex-row items-center justify-between px-3">
              <Pressable className="rounded bg-gray-100 px-2.5 py-0.5">
                <Text>No project</Text>
              </Pressable>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded bg-black"
                onPress={() => setEditModalOpen(false)}
              >
                <RemixIcon name="check-line" color="white"></RemixIcon>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
