import { defineStore } from "pinia";
import { trpc } from "../main.ts";

type User = Awaited<ReturnType<typeof trpc.auth.current.query>>;
export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as null | User,
  }),
  actions: {
    async fetchUser() {
      this.user = await trpc.auth.current.query();
    },
    async update(data: Partial<User>) {
      this.user = await trpc.auth.update.mutate({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
      });
    },
  },
});
