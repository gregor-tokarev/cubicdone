import React, { useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { ProjectItem } from "./ProjectItem";
import { Project } from "contract-models";
import RemixIcon from "react-native-remix-icon";

interface ProjectSelectModalProps extends React.PropsWithChildren {
  projects: Project[];
  projectModalOpen: boolean;
  setProjectModalOpen: (value: boolean) => void;
  selectedProjectId: Project["id"] | null;
  onSelectProject: (id: Project["id"]) => void;
}

export default function ProjectSelectModal(props: ProjectSelectModalProps) {
  const searchRef = useRef<TextInput>(null);

  return (
    <Modal
      visible={props.projectModalOpen}
      className="bg-sky-400"
      transparent
      statusBarTranslucent
      onRequestClose={() => props.setProjectModalOpen(false)}
      animationType="fade"
    >
      <KeyboardAvoidingView className="flex-1 bg-black/40" behavior="padding">
        <View className="mt-auto max-h-[350px] rounded-t-xl bg-white pb-3 pt-5">
          <FlatList
            data={props.projects}
            renderItem={({ item }) => (
              <Pressable onPress={() => props.onSelectProject(item.id)}>
                <ProjectItem
                  checked={props.selectedProjectId === item.id}
                  project={item}
                ></ProjectItem>
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
  );
}
