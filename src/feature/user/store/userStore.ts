import { create } from "zustand";
import toast from "react-hot-toast";
import { User } from "../types/types";

interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;

  fetchUsers: (userId?: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  // 🧠 Fetch users from API
  fetchUsers: async (userId?: string) => {
    set({ loading: true });
    try {
      const query = userId ? `?userId=${userId}` : "";
      const res = await fetch(`/api/auth/user${query}`);
      if (!res.ok) throw new Error("Failed to fetch users");
    
      const data = await res.json();
      if (data.success) {
        set({ users: data.users, loading: false });
      } else {
        throw new Error(data.error || "Failed to fetch users");
      }
      
    } catch (err: any) {
      console.error("fetchUsers error:", err);
      toast.error("Failed to load users");
      set({ error: err.message, loading: false });
    }
  },
}));