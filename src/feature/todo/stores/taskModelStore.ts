import { create } from "zustand";

interface TaskModelState {
  isOpen: boolean;
  mode: "add" | "edit";
  openModal: (mode?: "add" | "edit") => void;
  closeModal: () => void;
}

export const useTaskModalStore = create<TaskModelState>((set) => ({
  isOpen: false,
  mode: "add",
  openModal: (mode = "add") => set({ isOpen: true, mode }),
  closeModal: () => set({ isOpen: false }),
}));
