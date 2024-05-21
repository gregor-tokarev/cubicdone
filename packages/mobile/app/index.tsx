import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import DraftRow from "../components/DraftRow";
import RemixIcon from "react-native-remix-icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";
import { useDraftStore } from "../store/draft.store";
import { useProjectStore } from "../store/project.store";

export default function Page() {
  const { data: drafts } = trpc.draft.getAll.useQuery();
  const { data: projects } = trpc.project.getAll.useQuery();

  const setDrafts = useDraftStore((state) => state.setDrafts);
  useEffect(() => {
    drafts && setDrafts(drafts);
  }, [drafts]);

  const setProjects = useProjectStore((state) => state.setProjects);
  useEffect(() => {
    projects && setProjects(projects);
  }, [projects]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const onOpenEditModal = useCallback(() => {
    setEditModalOpen(true);

    inputRef.current?.focus();
  }, []);

  const searchRef = useRef<TextInput>(null);

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
      {drafts?.length ? (
        <FlatList
          className="pt-10"
          data={drafts}
          renderItem={({ item }) => <DraftRow draft={item}></DraftRow>}
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
        className="absolute bottom-10 right-10 h-16 w-16 items-center justify-center rounded-md bg-black"
        onPress={() => onOpenEditModal()}
      >
        <RemixIcon name="add-line" color="white" size={28}></RemixIcon>
      </Pressable>
      <Modal
        visible={editModalOpen}
        className="bg-sky-400"
        transparent
        statusBarTranslucent
        onRequestClose={() => setEditModalOpen(false)}
        animationType="fade"
      >
        <KeyboardAvoidingView className="flex-1 bg-black/40" behavior="padding">
          <View className="mt-auto rounded-t-xl bg-white pb-2">
            <TextInput
              ref={inputRef}
              placeholder="Task point"
              className="block w-full border-b border-gray-300 p-2.5"
            ></TextInput>
            <View className="mt-4 flex-row items-center justify-between px-3">
              <Pressable
                className="rounded bg-gray-100 px-2.5 py-0.5"
                onPress={() => onProjectModalOpen()}
              >
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
      <Modal
        visible={projectModalOpen}
        className="bg-sky-400"
        transparent
        statusBarTranslucent
        onRequestClose={() => setProjectModalOpen(false)}
        animationType="fade"
      >
        <KeyboardAvoidingView className="flex-1 bg-black/40" behavior="padding">
          <View className="mt-auto max-h-[350px] rounded-t-xl bg-white pb-3 pt-5">
            <FlatList
              data={projects}
              renderItem={({ item }) => (
                <Pressable onPress={() => onSelectProject()}>
                  <ProjectItem checked={false} project={item}></ProjectItem>
                </Pressable>
              )}
            ></FlatList>
            <Pressable
              className="mx-3 mt-3 flex-row space-x-2 rounded-lg bg-gray-100 px-2 py-1.5"
              onPress={() => searchRef.current?.focus()}
            >
              <RemixIcon name="search-line" color="#333" size={24}></RemixIcon>
              <TextInput
                ref={searchRef}
                className="placeholder-gray-50"
                placeholder="Search"
              ></TextInput>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
