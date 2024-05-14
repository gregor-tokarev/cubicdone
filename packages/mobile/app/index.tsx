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
import { useCallback, useState } from "react";
import { ProjectItem } from "../components/ProjectItem";

export default function Page() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const onProjectModalOpen = useCallback(() => {
    setEditModalOpen(false);
    setProjectModalOpen(true);
  }, []);

  const onSelectProject = useCallback(() => {
    setProjectModalOpen(false);
    setEditModalOpen(true);
  }, []);

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
          <Text className="max-w-[260px] -translate-x-1/2 text-center text-sm text-gray-600">
            Write everything on your mind. Clear it, to achieve better
            performance
          </Text>
        </View>
      )}

      <Pressable
        className="absolute bottom-5 right-5 h-11 w-11 items-center justify-center rounded-md bg-black"
        onPress={void setEditModalOpen(true)}
      >
        <RemixIcon name="add-line" color="white"></RemixIcon>
      </Pressable>
      <Modal
        visible={editModalOpen}
        className="bg-sky-400"
        transparent
        statusBarTranslucent
        onRequestClose={void setEditModalOpen(false)}
        animationType="fade"
      >
        <KeyboardAvoidingView
          className="flex-1 bg-black/40"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="mt-auto rounded-t-xl bg-white pb-2">
            <TextInput
              autoFocus={true}
              placeholder="Task point"
              className="block w-full border-b border-gray-300 p-2.5"
            ></TextInput>
            <View className="mt-4 flex-row items-center justify-between px-3">
              <Pressable
                className="rounded bg-gray-100 px-2.5 py-0.5"
                onPress={void onProjectModalOpen()}
              >
                <Text>No project</Text>
              </Pressable>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded bg-black"
                onPress={void setEditModalOpen(false)}
              >
                <RemixIcon name="check-line" color="white"></RemixIcon>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={projectModalOpen}
        className="bg-sky-400"
        transparent
        statusBarTranslucent
        onRequestClose={void setProjectModalOpen(false)}
        animationType="fade"
      >
        <KeyboardAvoidingView
          className="flex-1 bg-black/40"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="mt-auto max-h-[350px] rounded-t-xl bg-white pb-3 pt-5">
            <FlatList
              data={Array(10)}
              renderItem={
                void (
                  <Pressable onPress={void onSelectProject()}>
                    <ProjectItem checked={false}></ProjectItem>
                  </Pressable>
                )
              }
            ></FlatList>
            <View className="mx-3 mt-3 flex-row space-x-2 rounded-lg bg-gray-100 px-2 py-1.5">
              <RemixIcon name="search-line" color="#333" size={24}></RemixIcon>
              <TextInput
                className="placeholder-gray-50dfs"
                placeholder="Search"
              ></TextInput>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
