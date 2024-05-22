import { FlatList, Pressable, Text, View } from "react-native";
import DraftRow from "../components/DraftRow";
import RemixIcon from "react-native-remix-icon";
import { useCallback, useEffect, useState } from "react";
import { Project } from "contract-models";
import { trpc } from "../lib/trpc";
import { useDraftStore } from "../store/draft.store";
import { useProjectStore } from "../store/project.store";
import "react-native-get-random-values";
import { DraftEditModal } from "../components/DraftEditModal";
import ProjectSelectModal from "../components/ProjectSelectModal";

export default function Page() {
  const { data: drafts, refetch: refreshDrafts } = trpc.draft.getAll.useQuery();
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

  const onProjectModalOpen = useCallback(() => {
    setEditModalOpen(false);
    setProjectModalOpen(true);
  }, []);

  const [projectId, setProjectId] = useState<Project["id"] | null>(null);

  const onSelectProject = useCallback((projectId: Project["id"]) => {
    setProjectId(projectId);

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
        onPress={() => setEditModalOpen(true)}
      >
        <RemixIcon name="add-line" color="white" size={28}></RemixIcon>
      </Pressable>
      <DraftEditModal
        editModalOpen={editModalOpen}
        onEditModalOpen={setEditModalOpen}
        onOpenProjectModal={() => onProjectModalOpen()}
        onSubmit={() => refreshDrafts()}
        projectId={projectId}
      ></DraftEditModal>
      {projects && (
        <ProjectSelectModal
          projects={projects}
          projectModalOpen={projectModalOpen}
          setProjectModalOpen={setProjectModalOpen}
          selectedProjectId={projectId}
          onSelectProject={onSelectProject}
        ></ProjectSelectModal>
      )}
    </View>
  );
}
