import { defineStore } from "pinia";

interface DeleteModalOptions {
  titleText: string;
  descriptionText: string;
}

interface Fn {
  (value: boolean): void;
}

export const useDeleteModalStore = defineStore("deleteModal", {
  state: () => ({
    resolveFn: null as null | Fn,
    modalOptions: null as DeleteModalOptions | null,
    open: false,
  }),
  actions: {
    use(options: DeleteModalOptions): Promise<boolean> {
      this.open = true;

      return new Promise((resolve) => {
        this.resolveFn = resolve;
        this.modalOptions = options;
      });
    },
    close() {
      this.resolveFn = null;
      this.modalOptions = null;
      this.open = false;
    },
  },
});
