import { create } from "zustand";
import toast from "react-hot-toast";
import { Prospect } from "../types/types";
import { exportProspectsToExcel, exportProspectsWithColumns, exportSingleProspectToExcel } from "../libs/excelExport";
import { importProspectsFromExcel, generateProspectImportTemplate } from "../libs/excelImport";
import { FilterData } from "../libs/filterData";
import { useUserStore } from "../../user/store/userStore";

interface ProspectStore {
  prospects: Prospect[];
  filteredProspects: Prospect[];
  loading: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  isExporting: boolean;
  error: string | null;
  filters: FilterData;

  fetchProspects: (ownerId?: string) => Promise<void>;
  setFilters: (filters: FilterData) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  generateOwnerOptions: () => any[];
  initializeOwnerOptions: () => void;
  addProspect: (prospect: Omit<Prospect, "id" | "ownerId" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProspect: (id: string, prospect: Partial<Prospect>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
  exportAllProspects: (filename?: string) => void;
  exportSelectedProspects: (prospectIds: string[], filename?: string) => void;
  exportSingleProspect: (prospectId: string, filename?: string) => void;
  exportProspectsWithColumns: (columns: (keyof Prospect)[], filename?: string) => void;
  importProspectsFromExcel: (file: File) => Promise<void>;
  downloadImportTemplate: (filename?: string) => void;
}

export const useProspectsStore = create<ProspectStore>((set, get) => ({
  prospects: [],
  filteredProspects: [],
  loading: false,
  isDeleting: false,
  isEditing: false,
  isExporting: false,
  error: null,
  filters: {
    status: [
      { id: "all", label: "All Status", checked: true },
      { id: "new", label: "New", checked: false },
      { id: "Cold", label: "Cold", checked: false },
      { id: "Qualified", label: "Qualified", checked: false },
      { id: "Warmlead", label: "Warm-lead", checked: false },
      { id: "converted", label: "Converted", checked: false },
      { id: "notintrested", label: "Not-intrested", checked: false },
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

  // Build owner filter options from users
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
      filters: {
        ...state.filters,
        owner: ownerOptions,
      },
    }));
  },

  // Filters management
  setFilters: (newFilters: FilterData) => {
    set({ filters: newFilters });
  },

  applyFilters: () => {
    const { prospects, filters } = get();
    let filtered = [...prospects];

    // Status filter mapping (ids to Prospect['status'] values)
    const activeStatus = filters.status.filter((s: any) => s.checked && s.id !== "all");
    if (activeStatus.length > 0) {
      filtered = filtered.filter((p: Prospect) =>
        activeStatus.some((f: any) => {
          const map: Record<string, Prospect['status']> = {
            new: 'New',
            Cold: 'Cold',
            Qualified: 'Qualified',
            Warmlead: 'Warmlead',
            converted: 'Converted',
            notintrested: 'Notintrested',
          };
          const expected = map[f.id];
          return expected ? p.status === expected : false;
        })
      );
    }

    // Owner filter: compare owner id (if object) or owner name/email string to option id/label
    const activeOwners = filters.owner.filter((o: any) => o.checked && o.id !== "all");
    if (activeOwners.length > 0) {
      filtered = filtered.filter((p: Prospect) =>
        activeOwners.some((f: any) => {
          if (f.id === "me") {
            // TODO: Replace with real current user id
            const currentId = "current-user-id";
            if (typeof p.owner === 'object') return p.owner?.id === currentId;
            return false;
          }
          if (typeof p.owner === 'object') {
            return p.owner?.id === f.id || p.owner?.email === f.label || p.owner?.name === f.label;
          }
          // owner stored as string (name/email)
          return typeof p.owner === 'string' && (p.owner === f.label);
        })
      );
    }

    // Tags filter
    const activeTags = filters.tags.filter((t: any) => t.checked && t.id !== "all");
    if (activeTags.length > 0) {
      filtered = filtered.filter((p: Prospect) => {
        const tags = (p.tags || []).map((t) => t.toLowerCase());
        return activeTags.some((f: any) => tags.includes(f.label.toLowerCase()));
      });
    }

    set({ filteredProspects: filtered });
  },

  resetFilters: () => {
    const initial = {
      status: [
        { id: "all", label: "All Status", checked: true },
        { id: "new", label: "New", checked: false },
        { id: "Cold", label: "Cold", checked: false },
        { id: "Qualified", label: "Qualified", checked: false },
        { id: "Warmlead", label: "Warm-lead", checked: false },
        { id: "converted", label: "Converted", checked: false },
        { id: "notintrested", label: "Not-intrested", checked: false },
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
    set({ filters: initial, filteredProspects: get().prospects });
  },

  // 🧠 Fetch prospects from API
  fetchProspects: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/prospects${query}`);
      if (!res.ok) throw new Error("Failed to fetch prospects");

      const data: Prospect[] = await res.json();
      const cleanData: Prospect[] = data?.length ? data.map(prospect => {
        const ownerName = typeof prospect.owner === 'object' && prospect.owner?.name
          ? prospect.owner.name
          : typeof prospect.owner === 'string'
          ? prospect.owner
          : 'Unknown';

        const ownerAvatar = typeof prospect.owner === 'object' && prospect.owner?.email
          ? prospect.owner.email // Using email as avatar fallback, you might want to use a proper avatar field
          : undefined;

        return {
          ...prospect,
          owner: ownerName,
          ownerAvatar: ownerAvatar
        };
      }) : data;
      set({ prospects: cleanData, loading: false });
      get().applyFilters();
    } catch (err: any) {
      console.error("fetchProspects error:", err);
      toast.error("Failed to load prospects");
      set({ error: err.message, loading: false });
    }
  },

  // ➕ Add a new prospect
  addProspect: async (prospect) => {
    try {
      const res = await fetch(`/api/admin/prospects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospect),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create prospect");
      }

      const created: Prospect = await res.json();
      // Mirror companies/customers pattern: inject owner from submitted payload
      set({
        prospects: [
          ...get().prospects,
          {
            ...created,
            owner:
              prospect && (prospect as any).owner
                ? {
                    id: (prospect as any).owner.id as string,
                    name: (prospect as any).owner.name,
                    email: ((prospect as any).owner?.email as string) || "",
                  }
                : created.owner,
          },
        ],
      });
      get().applyFilters();
      toast.success("Prospect created successfully!");
    } catch (err: any) {
      console.error("addProspect error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // ✏️ Update a prospect
  updateProspect: async (id, prospect) => {
    set({ isEditing: true });
    try {
      const res = await fetch(`/api/admin/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospect),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update prospect");
      }

      const updated: Prospect = await res.json();
      set({
        prospects: get().prospects.map((p) => (p.id === id ? updated : p)),
      });
      get().applyFilters();
      toast.success("Prospect updated successfully!");
    } catch (err: any) {
      console.error("updateProspect error:", err);
      toast.error(err.message);
      set({ error: err.message });
    } finally {
      set({ isEditing: false });
    }
  },

  // ❌ Delete a prospect
  deleteProspect: async (id) => {
    set({ isDeleting: true });
    try {
      const res = await fetch(`/api/admin/prospects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete prospect");

      set({
        prospects: get().prospects.filter((p) => p.id !== id),
      });
      get().applyFilters();
      toast.success("Prospect deleted successfully!");
    } catch (err: any) {
      console.error("deleteProspect error:", err);
      toast.error(err.message);
      set({ error: err.message });
    } finally {
      set({ isDeleting: false });
    }
  },

  // 📊 Export all prospects to Excel (use filtered)
  exportAllProspects: (filename?: string) => {
    const { filteredProspects } = get();
    const result = exportProspectsToExcel(filteredProspects, filename);
    if (result.success) {
      toast.success(`Prospects exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export selected prospects to Excel
  exportSelectedProspects: (prospectIds: string[], filename?: string) => {
    const { prospects } = get();
    const selectedProspects = prospects.filter(prospect => prospectIds.includes(prospect.id));
    if (selectedProspects.length === 0) {
      toast.error('No prospects selected for export');
      return;
    }
    const result = exportProspectsToExcel(selectedProspects, filename);
    if (result.success) {
      toast.success(`Selected prospects exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export single prospect to Excel
  exportSingleProspect: (prospectId: string, filename?: string) => {
    const { prospects } = get();
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect) {
      toast.error('Prospect not found');
      return;
    }
    const result = exportSingleProspectToExcel(prospect, filename);
    if (result.success) {
      toast.success(`Prospect ${prospect.fullName || 'Unknown'} exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export prospects with custom columns
  exportProspectsWithColumns: (columns: (keyof Prospect)[], filename?: string) => {
    const { prospects } = get();
    const result = exportProspectsWithColumns(prospects, columns, filename);
    if (result.success) {
      toast.success(`Prospects exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📥 Import prospects from Excel
  importProspectsFromExcel: async (file: File) => {
    try {
      const result = await importProspectsFromExcel(file);
      
      if (!result.success) {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
        return;
      }

      if (!result.data || result.data.length === 0) {
        toast.error('No valid prospect data found in the file');
        return;
      }

      // Process each prospect through the API
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const prospectData of result.data) {
        try {
          const prospectPayload = {
            ...prospectData,
            company: prospectData.company || 'Unknown Company',
            status: prospectData.status || 'New',
          };

          console.log('Importing prospect:', prospectPayload);

          const res = await fetch('/api/admin/prospects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prospectPayload),
          });

          if (!res.ok) {
            const errorResponse = await res.json();
            console.error('API Error Response:', errorResponse);
            throw new Error(errorResponse.error || errorResponse.message || 'Failed to create prospect');
          }

          const created: Prospect = await res.json();
          set({ prospects: [...get().prospects, created] });
          successCount++;
        } catch (err: any) {
          errorCount++;
          const errorMessage = err.message || 'Unknown error';
          errors.push(`${prospectData.fullName}: ${errorMessage}`);
          console.error(`Failed to import ${prospectData.fullName}:`, err);
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} prospects!`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} prospects. Check console for details.`);
        console.error('Import errors:', errors);
      }

      if (result.errors && result.errors.length > 0) {
        console.warn('Import warnings:', result.errors);
        toast(`Import completed with ${result.errors.length} warnings. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (err: any) {
      console.error('Import error:', err);
      toast.error('Failed to import prospects from Excel file');
    }
  },

  // 📥 Download import template
  downloadImportTemplate: (filename?: string) => {
    const result = generateProspectImportTemplate(filename);
    if (result.success) {
      toast.success('Import template downloaded successfully!');
    } else {
      toast.error(result.message);
    }
  },
}));