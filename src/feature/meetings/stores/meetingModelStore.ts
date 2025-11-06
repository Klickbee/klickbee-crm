import { create } from "zustand";

interface MeetingModelState {
  isOpen: boolean;
  mode: "add" | "edit";
  openModal: (mode?: "add" | "edit") => void;
  closeModal: () => void;
}

export const useMeetingModalStore = create<MeetingModelState>((set) => ({
  isOpen: false,
  mode: "add",
  openModal: (mode = "add") => set({ isOpen: true, mode }),
  closeModal: () => set({ isOpen: false }),
}));
