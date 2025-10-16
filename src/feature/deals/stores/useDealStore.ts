import { create } from "zustand";
import toast from "react-hot-toast";
import { Deal } from "../types";
import { exportDealsToExcel, exportDealsWithColumns, exportSingleDealToExcel } from "../libs/excelExport";
import { importDealsFromExcel, generateDealImportTemplate } from "../libs/excelImport";
import { FilterData } from "../libs/filterData";
import { useUserStore } from "../../user/store/userStore";


interface DealStore {
  deals: Deal[];
  filteredDeals: Deal[];
  loading: boolean;
  error: string | null;
  filters: FilterData;
  closedDateFilter: Date | null;

  fetchDeals: (ownerId?: string) => Promise<void>;
  setFilters: (filters: FilterData) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  setClosedDateFilter: (date: Date | null) => void;
  generateOwnerOptions: () => any[];
  initializeOwnerOptions: () => void;
  addDeal: (deal: Omit<Deal, "id" | "ownerId" | "createdAt">) => Promise<void>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  exportAllDeals: (filename?: string) => void;
  exportSelectedDeals: (dealIds: string[], filename?: string) => void;
  exportSingleDeal: (dealId: string, filename?: string) => void;
  exportDealsWithColumns: (columns: (keyof Deal)[], filename?: string) => void;
  importDealsFromExcel: (file: File) => Promise<void>;
  downloadImportTemplate: (filename?: string) => void;
}

export const useDealStore = create<DealStore>((set, get) => ({
  deals: [],
  filteredDeals: [],
  loading: false,
  error: null,
  filters: {
    status: [
      { id: "all", label: "All Status", checked: true },
      { id: "new", label: "New", checked: false },
      { id: "contacted", label: "Contacted", checked: false },
      { id: "proposal", label: "Proposal Sent", checked: false },
      { id: "negotiation", label: "Negotiation", checked: false },
      { id: "won", label: "Won", checked: false },
      { id: "lost", label: "Lost", checked: false },
    ],
    owner: [],
    tags: [
      { id: "all", label: "All Tags", checked: true },
      { id: "weblead", label: "Web Lead", checked: false },
      { id: "referral", label: "Referral", checked: false },
      { id: "vip", label: "VIP", checked: false },
      { id: "construction", label: "Construction", checked: false },
      { id: "architecture", label: "Architecture", checked: false },
    ],
  },
  closedDateFilter: null,

  // Build owner filter options
  generateOwnerOptions: () => {
    const { users } = useUserStore.getState();
    const userOptions = users.slice(0, 5).map((user) => ({
      id: user.id,
      label: user.name || user.email,
      checked: false,
    }));
    return [
      { id: "all", label: "All Owner", checked: true },
      { id: "me", label: "Me", checked: false },
      ...userOptions,
    ];
  },

  initializeOwnerOptions: () => {
    const ownerOptions = get().generateOwnerOptions();
    set((state) => ({
      filters: { ...state.filters, owner: ownerOptions },
    }));
  },

  // Filters management
  setFilters: (newFilters: FilterData) => {
    set({ filters: newFilters });
  },

  setClosedDateFilter: (date: Date | null) => {
    set({ closedDateFilter: date });
    get().applyFilters();
  },

  applyFilters: () => {
    const { deals, filters, closedDateFilter } = get();
    let filtered = [...deals];

    // Status filter -> map to stage field
    const activeStatus = filters.status.filter((s: any) => s.checked && s.id !== "all");
    if (activeStatus.length > 0) {
      const map: Record<string, string> = {
        new: 'New',
        contacted: 'Contacted',
        proposal: 'Proposal',
        negotiation: 'Negotiation',
        won: 'Won',
        lost: 'Lost',
      };
      filtered = filtered.filter((d: any) =>
        activeStatus.some((f: any) => (map[f.id] ? d.stage === map[f.id] : false))
      );
    }

    // Owner filter
    const activeOwners = filters.owner.filter((o: any) => o.checked && o.id !== "all");
    if (activeOwners.length > 0) {
      filtered = filtered.filter((d: any) =>
        activeOwners.some((f: any) => {
          if (f.id === "me") {
            const currentUserId = useUserStore.getState().getCurrentUserId();
            return d.ownerId === currentUserId;
          }
          // Store fetch maps owner to name string; also check ownerId if present
          return d.ownerId === f.id || d.owner === f.label;
        })
      );
    }

    // Tags filter (deal.tags may be string or array)
    const activeTags = filters.tags.filter((t: any) => t.checked && t.id !== "all");
    if (activeTags.length > 0) {
      filtered = filtered.filter((d: any) => {
        const tagsArr: string[] = Array.isArray(d.tags)
          ? d.tags
          : (typeof d.tags === 'string' ? d.tags.split(',').map((t: string) => t.trim()) : []);
        const tagsLower = tagsArr.map((t) => t.toLowerCase());
        return activeTags.some((f: any) => tagsLower.includes(f.label.toLowerCase()));
      });
    }

    // Closed date filter
    if (closedDateFilter) {
      filtered = filtered.filter((d: any) => {
        if (!d.closeDate) return false;
        const dealDate = new Date(d.closeDate);
        const filterDate = new Date(closedDateFilter);
        // Filter for deals with closeDate >= selected date
        return dealDate >= filterDate;
      });
    }

    set({ filteredDeals: filtered });
  },

  resetFilters: () => {
    const initial = {
      status: [
        { id: "all", label: "All Status", checked: true },
        { id: "new", label: "New", checked: false },
        { id: "contacted", label: "Contacted", checked: false },
        { id: "proposal", label: "Proposal Sent", checked: false },
        { id: "negotiation", label: "Negotiation", checked: false },
        { id: "won", label: "Won", checked: false },
        { id: "lost", label: "Lost", checked: false },
      ],
      owner: get().generateOwnerOptions(),
      tags: [
        { id: "all", label: "All Tags", checked: true },
        { id: "weblead", label: "Web Lead", checked: false },
        { id: "referral", label: "Referral", checked: false },
        { id: "vip", label: "VIP", checked: false },
        { id: "construction", label: "Construction", checked: false },
        { id: "architecture", label: "Architecture", checked: false },
      ],
    };
    set({ filters: initial, filteredDeals: get().deals, closedDateFilter: null });
  },

  // 🔧 Test function to set current user (for debugging)
  setCurrentUserForTesting: (userId: string) => {
    const { users } = useUserStore.getState();
    const user = users.find(u => u.id === userId);
    if (user) {
      useUserStore.getState().setCurrentUser(user);
      console.log('Set current user to:', user);
    } else {
      console.log('User not found:', userId);
    }
  },
  fetchDeals: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/deals${query}`);
      if (!res.ok) throw new Error("Failed to fetch deals");

      const data: any[] = await res.json();
      const cleanData: Deal[] = Array.isArray(data)
        ? data.map((d: any) => ({
            ...d,
            owner: typeof d.owner === 'object' && d.owner ? (d.owner.name || d.owner.email || '')
                  : (typeof d.owner === 'string' ? d.owner : ''),
            ownerId: typeof d.owner === 'object' && d.owner ? d.owner.id : (d.ownerId ?? undefined),
          }))
        : [];
      set({ deals: cleanData, loading: false });
      get().applyFilters();

      // Initialize current user if not set and we have users data
      const { users, currentUser } = useUserStore.getState();

      if (users.length > 0) {
        // Initialize current user from localStorage if not already set
        if (!currentUser) {
          useUserStore.getState().initializeCurrentUser();

          // If still no current user, set safi as default (since user is logged in as safi)
          const { currentUser: newCurrentUser } = useUserStore.getState();
          if (!newCurrentUser) {
            const safiUser = users.find(u => u.name === 'safi');
            if (safiUser) {
              useUserStore.getState().setCurrentUser(safiUser);
            }
          }
        }
      }
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

      const created: any = await res.json();
      const normalized: Deal = {
        ...created,
        owner: typeof created.owner === 'object' && created.owner
          ? (created.owner.name || created.owner.email || '')
          : (typeof created.owner === 'string' ? created.owner : (deal.owner || '')),
        ownerId: typeof created.owner === 'object' && created.owner
          ? created.owner.id
          : created.ownerId,
      };
      set({ deals: [ ...get().deals, normalized ] });
      get().applyFilters();
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

      const updatedRaw: any = await res.json();
      const updated: Deal = {
        ...updatedRaw,
        owner: typeof updatedRaw.owner === 'object' && updatedRaw.owner
          ? (updatedRaw.owner.name || updatedRaw.owner.email || '')
          : (typeof updatedRaw.owner === 'string' ? updatedRaw.owner : ''),
        ownerId: typeof updatedRaw.owner === 'object' && updatedRaw.owner
          ? updatedRaw.owner.id
          : updatedRaw.ownerId,
      };
      set({ deals: get().deals.map((d) => (d.id === id ? updated : d)) });
      get().applyFilters();
      toast.success("Deal Updated successfully!");

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
      get().applyFilters();
      toast.success("Deal deleted successfully!");
    } catch (err: any) {
      console.error("deleteDeal error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // 📊 Export all deals to Excel (use filtered)
  exportAllDeals: (filename?: string) => {
    const { filteredDeals } = get();
    const result = exportDealsToExcel(filteredDeals, filename);
    if (result.success) {
      toast.success(`Deals exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export selected deals to Excel
  exportSelectedDeals: (dealIds: string[], filename?: string) => {
    const { deals } = get();
    const selectedDeals = deals.filter(deal => dealIds.includes(deal.id));
    if (selectedDeals.length === 0) {
      toast.error('No deals selected for export');
      return;
    }
    const result = exportDealsToExcel(selectedDeals, filename);
    if (result.success) {
      toast.success(`Selected deals exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export single deal to Excel
  exportSingleDeal: (dealId: string, filename?: string) => {
    const { deals } = get();
    const deal = deals.find(d => d.id === dealId);
    if (!deal) {
      toast.error('Deal not found');
      return;
    }
    const result = exportSingleDealToExcel(deal, filename);
    if (result.success) {
      toast.success(`Deal ${deal.dealName || 'Unknown'} exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export deals with custom columns
  exportDealsWithColumns: (columns: (keyof Deal)[], filename?: string) => {
    const { deals } = get();
    const result = exportDealsWithColumns(deals, columns, filename);
    if (result.success) {
      toast.success(`Deals exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📥 Import deals from Excel
  importDealsFromExcel: async (file: File) => {
    try {
      const result = await importDealsFromExcel(file);
      
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (!result.data || result.data.length === 0) {
        toast.error('No valid deal data found in the file');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const dealData of result.data) {
        try {
          const dealPayload = {
            ...dealData,
            company: dealData.company || 'Unknown Company',
            contact: dealData.contact || 'Unknown Contact',
            stage: dealData.stage || 'New',
            amount: dealData.amount || 0,
          };

          const res = await fetch('/api/admin/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dealPayload),
          });

          if (!res.ok) {
            throw new Error('Failed to create deal');
          }

          const created: Deal = await res.json();
          set({ deals: [...get().deals, created] });
          successCount++;
        } catch (err: any) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} deals!`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} deals.`);
      }

    } catch (err: any) {
      toast.error('Failed to import deals from Excel file');
    }
  },

  // 📥 Download import template
  downloadImportTemplate: (filename?: string) => {
    const result = generateDealImportTemplate(filename);
    if (result.success) {
      toast.success('Import template downloaded successfully!');
    } else {
      toast.error(result.message);
    }
  },
}));
