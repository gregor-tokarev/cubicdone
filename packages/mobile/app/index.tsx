import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import DraftRow from "../components/DraftRow";
import RemixIcon from "react-native-remix-icon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Draft, Project } from "contract-models";
import { trpc } from "../lib/trpc";
import { useDraftStore } from "../store/draft.store";
import { useProjectStore } from "../store/project.store";
import "react-native-get-random-values";
import { DraftEditModal } from "../components/DraftEditModal";
import ProjectSelectModal from "../components/ProjectSelectModal";

export default function Page() {
  const {
    data: drafts,
    refetch: refreshDrafts,
    isLoading: loadingDrafts,
  } = trpc.draft.getAll.useQuery();
  const {
    data: projects,
    refetch: refreshProjects,
    isLoading: loadingProjects,
  } = trpc.project.getAll.useQuery();

  const setDrafts = useDraftStore((state) => state.setDrafts);
  useEffect(() => {
    console.log(drafts);
    drafts && setDrafts(drafts);
  }, [drafts]);

  const setProjects = useProjectStore((state) => state.setProjects);
  useEffect(() => {
    projects && setProjects(projects);
  }, [projects]);

  const onRefresh = useCallback(async () => {
    return Promise.all([refreshDrafts(), refreshProjects()]);
  }, [refreshDrafts, refreshProjects]);

  const loading = useMemo(
    () => loadingDrafts || loadingProjects,
    [loadingDrafts, loadingProjects],
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const onProjectModalOpen = useCallback(() => {
    setEditModalOpen(false);
    setProjectModalOpen(true);
  }, []);

  const [projectId, setProjectId] = useState<Project["id"] | null>(null);

  const [editDraftId, setEditDraftId] = useState<Draft["id"] | null>(null);
  const onEditDraft = useCallback(
    (draftId: Draft["id"]) => {
      const draft = drafts?.find((d) => d.id === draftId);

      setEditDraftId(draftId);
      draft?.projectId && setProjectId(draft.projectId);

      setEditModalOpen(true);
    },
    [drafts],
  );

  const onSelectProject = useCallback((projectId: Project["id"]) => {
    setProjectId(projectId);

    setEditModalOpen(true);
    setProjectModalOpen(false);
  }, []);

  const onSubmit = useCallback(() => {
    setEditModalOpen(false);
    setProjectModalOpen(false);

    setProjectId(null);
    setEditDraftId(null);

    refreshDrafts();
  }, [refreshDrafts]);

  return (
    <View className="relative flex-1">
      {drafts?.length ? (
        <FlatList
          className="pt-10"
          data={drafts.sort((prev, next) => prev.order - next.order)}
          renderItem={({ item }) => (
            <Pressable onPress={() => onEditDraft(item.id)}>
              <DraftRow draft={item}></DraftRow>
            </Pressable>
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => onRefresh()}
            ></RefreshControl>
          }
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
        onSubmit={() => onSubmit()}
        projectId={projectId}
        editedDraftId={editDraftId}
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
