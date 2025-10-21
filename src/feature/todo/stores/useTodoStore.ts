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

  fetchTodos: (ownerId?: string) => Promise<void>;
  setSearchTerm: (search: string) => void;
  setFilters: (filters: TodoFilters) => void;
  applyFilters: () => void;
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

  applyFilters: () => {
    const { todos, filters } = get();
    let filtered = [...todos];

    // Status filter
    const selStatus = filters.status.filter((f) => f.checked && f.id !== 'all').map((f) => f.id);
    if (selStatus.length > 0) {
      filtered = filtered.filter((t) => selStatus.includes(t.status));
    }

    // Priority filter
    const selPriority = filters.priority.filter((f) => f.checked && f.id !== 'all').map((f) => f.id);
    if (selPriority.length > 0) {
      filtered = filtered.filter((t) => selPriority.includes(t.priority));
    }

    // Owner filter - match assignedTo name/email/id; handle 'me' with current user ID
    const selOwners = filters.owner.filter((o) => o.checked && o.id !== 'all').map((o) => o.id);
    if (selOwners.length > 0) {
      filtered = filtered.filter((t) => {
        if (!t.assignedTo && !t.assignedId) return false;
        const currentUserId = useUserStore.getState().getCurrentUserId();
        if (selOwners.includes('me')) {
          return t.assignedId === currentUserId;  // Use assignedId for ID matching
        }
        // For other owners, match by assignedId or string assignedTo
        const assignedId = t.assignedId || (typeof t.assignedTo === 'string' ? t.assignedTo : '');
        return selOwners.includes(assignedId);
      });
    }

    set({ filteredTodos: filtered });
  },

  resetFilters: () => {
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
    set({ filters: initial, filteredTodos: get().todos });
  },
    setSearchTerm: (search: string) => {
  const { todos } = get();
  const filtered = todos.filter((d) =>
    d.taskName?.toLowerCase().includes(search.toLowerCase())
  );
  set({ filteredTodos: filtered });
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