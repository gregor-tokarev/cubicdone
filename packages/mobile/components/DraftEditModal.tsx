import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import React, { useCallback, useRef, useState } from "react";
import { trpc } from "../lib/trpc";
import { useDraftStore } from "../store/draft.store";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Project } from "contract-models";
import { useProjectStore } from "../store/project.store";

export interface DraftEditModalProps extends React.PropsWithChildren {
  onEditModalOpen: (value: boolean) => void;
  onOpenProjectModal: () => void;
  onSubmit: () => void;
  editModalOpen: boolean;

  projectId: Project["id"] | null;
}

export function DraftEditModal(props: DraftEditModalProps) {
  const inputRef = useRef<TextInput>(null);

  const [draftTitle, setDraftTitle] = useState("");

  const createDraft = trpc.draft.create.useMutation();

  const [loadingDraft, setLoadingDraft] = useState(false);

  const maxDraftsOrder = useDraftStore((state) =>
    Math.max(...state.drafts.map((d) => d.order)),
  );
  const onCreateProject = useCallback(async () => {
    if (loadingDraft) return;
    setLoadingDraft(true);

    try {
      await createDraft.mutateAsync({
        title: draftTitle,
        projectId: props.projectId,
        dateCreated: dayjs().toISOString(),
        dateUpdated: dayjs().toISOString(),
        order: maxDraftsOrder + 1,
        id: nanoid(3),
      });

      props.onSubmit();
    } catch (e) {
      console.error(e);
    } finally {
      props.onEditModalOpen(false);
      setLoadingDraft(false);
    }
  }, [draftTitle]);

  const project = useProjectStore((state) =>
    state.projects.find((p) => p.id === props.projectId),
  );

  return (
    <Modal
      visible={props.editModalOpen}
      className="bg-sky-400"
      transparent
      statusBarTranslucent
      onRequestClose={() => props.onEditModalOpen(false)}
      animationType="fade"
    >
      <KeyboardAvoidingView className="flex-1 bg-black/40" behavior="padding">
        <View className="mt-auto rounded-t-xl bg-white pb-2">
          <TextInput
            ref={inputRef}
            placeholder="Task point"
            onChangeText={(text) => setDraftTitle(text)}
            defaultValue={draftTitle}
            className="block w-full border-b border-gray-300 p-2.5"
          ></TextInput>
          <View className="mt-4 flex-row items-center justify-between px-3">
            <Pressable
              className={`rounded bg-${
                project ? project.color : "gray"
              }-100 px-2.5 py-0.5`}
              onPress={() => props.onOpenProjectModal()}
            >
              <Text className={`text-${project ? project.color : "gray"}-400 `}>
                {project ? "#" + project.title : "No project"}
              </Text>
            </Pressable>
            <Pressable
              className="h-9 w-9 items-center justify-center rounded bg-black"
              onPress={() => onCreateProject()}
            >
              {loadingDraft ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <RemixIcon name="check-line" color="white"></RemixIcon>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
