import { create } from "zustand";
import toast from "react-hot-toast";
import { Deal } from "../types";


interface DealStore {
  deals: Deal[];
  loading: boolean;
  error: string | null;

  fetchDeals: (ownerId?: string) => Promise<void>;
  addDeal: (deal: Omit<Deal, "id" | "ownerId" | "createdAt">) => Promise<void>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
}

export const useDealStore = create<DealStore>((set, get) => ({
  deals: [],
  loading: false,
  error: null,

  // 🧠 Fetch deals from API
  fetchDeals: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/deals${query}`);
      if (!res.ok) throw new Error("Failed to fetch deals");

      const data: any[] = await res.json();
      const cleanData: Deal[] = data?.length ? data.map(data => { return {...data, owner: data.owner.name}}) : data;
      set({ deals: cleanData, loading: false });
    } catch (err: any) {
      console.error("fetchDeals error:", err);
      toast.error("Failed to load deals");
      set({ error: err.message, loading: false });
    }
  },

  // ➕ Add a new deal
  addDeal: async (deal) => {
    try {
      const res = await fetch(`/api/admin/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deal),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create deal");
      }

      const created: Deal = await res.json();
      set({ deals: [...get().deals, created] });
      toast.success("Deal created successfully!");
    } catch (err: any) {
      console.error("addDeal error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // ✏️ Update a deal
  updateDeal: async (id, deal) => {
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deal),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update deal");
      }

      const updated: Deal = await res.json();
      set({
        deals: get().deals.map((d) => (d.id === id ? updated : d)),
      });

    } catch (err: any) {
      console.error("updateDeal error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // ❌ Delete a deal
  deleteDeal: async (id) => {
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete deal");

      set({
        deals: get().deals.filter((d) => d.id !== id),
      });
      toast.success("Deal deleted successfully!");
    } catch (err: any) {
      console.error("deleteDeal error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },
}));
