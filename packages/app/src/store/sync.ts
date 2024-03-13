import { defineStore } from "pinia";

export const useSyncStore = defineStore("sync", {
  state: () => ({
    syncCount: 0,
    isOnline: false,
  }),
});
