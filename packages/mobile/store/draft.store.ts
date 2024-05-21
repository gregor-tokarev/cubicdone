import { create } from "zustand";
import { Draft } from "contract-models";

export const useDraftStore = create((set) => ({
  drafts: [],
  setDrafts(drafts: Draft[]) {
    set({ drafts });
  },
}));
