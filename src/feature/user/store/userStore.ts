import { create } from "zustand";
import toast from "react-hot-toast";
import { User } from "../types/types";

interface UserStore {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;

  fetchUsers: (userId?: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  getCurrentUserId: () => string | null;
  initializeCurrentUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,
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

  // 👤 Initialize current user from localStorage
  initializeCurrentUser: () => {
    const storedUserId = localStorage.getItem('currentUserId');
    const { users } = get();

    if (storedUserId && users.length > 0) {
      const user = users.find(u => u.id === storedUserId);
      if (user) {
        set({ currentUser: user });
      }
    }
  },

  // 👤 Set current user and store in localStorage
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('currentUserId', user.id);
    } else {
      localStorage.removeItem('currentUserId');
    }
    set({ currentUser: user });
  },

  // 👥 Select user as current (helper method)
  selectAsCurrentUser: (userId: string) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    if (user) {
      get().setCurrentUser(user);
    }
  },

  // Get current user ID
  getCurrentUserId: () => {
    const { currentUser } = get();
    return currentUser ? currentUser.id : null;
  },
}));