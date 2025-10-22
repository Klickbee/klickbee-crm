import { create } from "zustand";
import toast from "react-hot-toast";
import { TaskData } from "../types/types";
import { useUserStore } from "../../user/store/userStore";

type FilterOption = { id: string; label: string; checked: boolean };
type TodoFilters = {
  status: FilterOption[];
  owner: FilterOption[];
  priority: FilterOption[];
};

interface TodoStore {
  todos: TaskData[];
  filteredTodos: TaskData[];
  loading: boolean;
  error: string | null;
  filters: TodoFilters;
  searchTerm: string;

  fetchTodos: (ownerId?: string) => Promise<void>;
  setSearchTerm: (search: string) => void;
  setFilters: (filters: TodoFilters) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => void;
  generateOwnerOptions: () => FilterOption[];
  initializeOwnerOptions: () => void;
  addTodo: (todo: Omit<TaskData, "id" | "ownerId" | "createdAt" | "updatedAt"> & { assignedId?: string; linkedId?: string }) => Promise<void>;
  updateTodo: (id: string, todo: Partial<TaskData>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  bulkDeleteTodos: (ids: string[]) => Promise<void>;
  bulkUpdateTodos: (ids: string[], updates: Partial<TaskData>) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  filteredTodos: [],
  loading: false,
  error: null,
  filters: {
    status: [
      { id: 'all', label: 'All Status', checked: true },
      { id: 'Todo', label: 'To-Do', checked: false },
      { id: 'InProgress', label: 'In-Progress', checked: false },
      { id: 'OnHold', label: 'On-Hold', checked: false },
      { id: 'Done', label: 'Done', checked: false },
    ],
    owner: [],
    priority: [
      { id: 'all', label: 'All Priority', checked: true },
      { id: 'Low', label: 'Low', checked: false },
      { id: 'Medium', label: 'Medium', checked: false },
      { id: 'High', label: 'High', checked: false },
      { id: 'Urgent', label: 'Urgent', checked: false },
    ],
  },
  searchTerm: "",

  // Build owner filter options from users
  generateOwnerOptions: () => {
    const { users } = useUserStore.getState();
    const userOptions = users.slice(0, 10).map((u) => ({ id: u.id, label: u.name || u.email, checked: false }));
    return [
      { id: 'all', label: 'All Owner', checked: true },
      ...userOptions,
    ];
  },

  initializeOwnerOptions: () => {
    const ownerOptions = get().generateOwnerOptions();
    set((state) => ({ filters: { ...state.filters, owner: ownerOptions } }));
  },

  setFilters: (filters: TodoFilters) => set({ filters }),

  applyFilters: async () => {
    const { filters, searchTerm } = get();
    
    try {
      set({ loading: true });
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Search term
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      // Status filter
      const activeStatus = filters.status.filter((s: any) => s.checked && s.id !== 'all');
      if (activeStatus.length > 0) {
        params.append('status', activeStatus.map((f: any) => f.id).join(','));
      }

      // Priority filter
      const activePriority = filters.priority.filter((p: any) => p.checked && p.id !== 'all');
      if (activePriority.length > 0) {
        params.append('priority', activePriority.map((f: any) => f.id).join(','));
      }

      // Owner filter
      const activeOwners = filters.owner.filter((o: any) => o.checked && o.id !== 'all');
      if (activeOwners.length > 0) {
        const ownerIds = activeOwners
          .map((f: any) => {
            if (f.id === "me") {
              const currentUserId = useUserStore.getState().getCurrentUserId();
              return currentUserId;
            }
            return f.id;
          })
          .filter(Boolean);
        if (ownerIds.length > 0) {
          params.append('assignedId', ownerIds.join(','));
        }
      }

      // Make API call with filters
      const queryString = params.toString();
      const url = queryString ? `/api/admin/todos?${queryString}` : '/api/admin/todos';
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch filtered todos");

      const data: any[] = await res.json();
      set({ todos: data, filteredTodos: data, loading: false });
      
    } catch (err: any) {
      console.error("applyFilters error:", err);
      toast.error("Failed to apply filters");
      set({ error: err.message, loading: false });
    }
  },

  resetFilters: async () => {
    const initial: TodoFilters = {
      status: [
        { id: 'all', label: 'All Status', checked: true },
        { id: 'Todo', label: 'To-Do', checked: false },
        { id: 'InProgress', label: 'In-Progress', checked: false },
        { id: 'OnHold', label: 'On-Hold', checked: false },
        { id: 'Done', label: 'Done', checked: false },
      ],
      owner: get().generateOwnerOptions(),
      priority: [
        { id: 'all', label: 'All Priority', checked: true },
        { id: 'Low', label: 'Low', checked: false },
        { id: 'Medium', label: 'Medium', checked: false },
        { id: 'High', label: 'High', checked: false },
        { id: 'Urgent', label: 'Urgent', checked: false },
      ],
    };
    set({ filters: initial, searchTerm: "" });
    await get().fetchTodos();
  },

  setSearchTerm: (search: string) => {
    set({ searchTerm: search });
    get().applyFilters();
  },

  //  Fetch todos from API
  fetchTodos: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/todos${query}`);
      if (!res.ok) throw new Error("Failed to fetch todos");

      const data: any[] = await res.json();
      set({ todos: data, loading: false });
      get().applyFilters();
    } catch (err: any) {
      console.error("fetchTodos error:", err);
      toast.error("Failed to load todos");
      set({ error: err.message, loading: false });
    }
  },

  //  Add a new todo
  addTodo: async (todo) => {
    try {
      const res = await fetch(`/api/admin/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create todo");
      }

      const created: TaskData = await res.json();
      set({ todos: [...get().todos, created] });
      get().applyFilters();
      toast.success("Todo created successfully!");
    } catch (err: any) {
      console.error("addTodo error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  //  Update a todo
  updateTodo: async (id, todo) => {
    try {
      const res = await fetch(`/api/admin/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update todo");
      }

      const updated: TaskData = await res.json();
      set({
        todos: get().todos.map((t) => (t.id === id ? updated : t)),
      });
      get().applyFilters();

    } catch (err: any) {
      console.error("updateTodo error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  //  Delete a todo
  deleteTodo: async (id) => {
    try {
      const res = await fetch(`/api/admin/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete todo");

      set({
        todos: get().todos.filter((t) => t.id !== id),
      });
      get().applyFilters();
      toast.success("Todo deleted successfully!");
    } catch (err: any) {
      console.error("deleteTodo error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  //  Bulk delete todos
  bulkDeleteTodos: async (ids) => {
    try {
      const deletePromises = ids.map(id => 
        fetch(`/api/admin/todos/${id}`, { method: "DELETE" })
      );
      
      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} todos`);
      }

      set({
        todos: get().todos.filter((t) => !ids.includes(t.id)),
      });
      get().applyFilters();
      toast.success(`${ids.length} todos deleted successfully!`);
    } catch (err: any) {
      console.error("bulkDeleteTodos error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  //  Bulk update todos
  bulkUpdateTodos: async (ids, updates) => {
    try {
      const updatePromises = ids.map(id => 
        fetch(`/api/admin/todos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      );
      
      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        throw new Error(`Failed to update ${failures.length} todos`);
      }

      // Update local state
      set({
        todos: get().todos.map((t) => 
          ids.includes(t.id) ? { ...t, ...updates } : t
        ),
      });
      get().applyFilters();
      toast.success(`${ids.length} todos updated successfully!`);
    } catch (err: any) {
      console.error("bulkUpdateTodos error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },
}));