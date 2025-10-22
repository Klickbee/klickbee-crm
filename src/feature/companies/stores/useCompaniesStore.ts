import { create } from "zustand";
import toast from "react-hot-toast";
import { Company } from "../types/types";
import { exportCompaniesToExcel, exportCompaniesWithColumns, exportSingleCompanyToExcel } from "../libs/excelExport";
import { importCompaniesFromExcel, generateCompanyImportTemplate } from "../libs/excelImport";
import { FilterData } from "../libs/fillterData";
import { useUserStore } from "../../user/store/userStore";

interface CompanyStore {
  companies: Company[];
  filteredCompanies: Company[];
  loading: boolean;
  error: string | null;
  filters: FilterData;
  searchTerm: string;

  fetchCompanies: (ownerId?: string) => Promise<void>;
  setSearchTerm: (search: string) => void;
  setFilters: (filters: FilterData) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => void;
  generateOwnerOptions: () => any[];
  initializeOwnerOptions: () => void;
  addCompany: (company: Omit<Company, "id" | "ownerId" | "createdAt">) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  exportAllCompanies: (filename?: string) => void;
  exportSelectedCompanies: (companyIds: string[], filename?: string) => void;
  exportSingleCompany: (companyId: string, filename?: string) => void;
  exportCompaniesWithColumns: (columns: (keyof Company)[], filename?: string) => void;
  importCompaniesFromExcel: (file: File) => Promise<void>;
  downloadImportTemplate: (filename?: string) => void;
}
export const useCompaniesStore = create<CompanyStore>((set, get) => ({
  companies: [],
  filteredCompanies: [],
  loading: false,
  error: null,
  filters: {
    status: [
      { id: "all", label: "All Status", checked: true },
      { id: "active", label: "Active", checked: false },
      { id: "follow-up", label: "Follow Up", checked: false },
      { id: "inactive", label: "Inactive", checked: false },
    ],
    owner: [], // Will be populated dynamically
    tags: [
      { id: "all", label: "All Tags", checked: true },
      { id: "weblead", label: "Web Lead", checked: false },
      { id: "referral", label: "Referral", checked: false },
      { id: "vip", label: "VIP", checked: false },
      { id: "construction", label: "Construction", checked: false },
      { id: "architecture", label: "Architecture", checked: false },
    ],
  },
  searchTerm: "",

  // Helper function to generate owner filter options from users
  generateOwnerOptions: () => {
    const { users } = useUserStore.getState();
    const userOptions = users.slice(0, 5).map((user) => ({
      id: user.id,
      label: user.name || user.email,
      checked: false,
    }));
    return [
      { id: "all", label: "All Owner", checked: true },
      // { id: "me", label: "Me", checked: false },
      ...userOptions,
    ];
  },

  // Initialize owner options when store is created
  initializeOwnerOptions: () => {
    const ownerOptions = get().generateOwnerOptions();
    set((state) => ({
      filters: {
        ...state.filters,
        owner: ownerOptions,
      },
    }));
  },

  // Filter management methods
  setFilters: (newFilters: FilterData) => {
    set({ filters: newFilters });
  },

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
      const activeStatus = filters.status.filter((s: any) => s.checked && s.id !== "all");
      if (activeStatus.length > 0) {
        const statusMap: Record<string, string> = {
          active: 'Active',
          'follow-up': 'FollowUp',
          inactive: 'inactive',
        };
        const statuses = activeStatus.map((f: any) => statusMap[f.id]).filter(Boolean);
        if (statuses.length > 0) {
          params.append('status', statuses.join(','));
        }
      }

      // Owner filter
      const activeOwners = filters.owner.filter((o: any) => o.checked && o.id !== "all");
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
          params.append('owners', ownerIds.join(','));
        }
      }

      // Tags filter
      const activeTags = filters.tags.filter((t: any) => t.checked && t.id !== "all");
      if (activeTags.length > 0) {
        const tags = activeTags.map((f: any) => f.label).filter(Boolean);
        if (tags.length > 0) {
          params.append('tags', tags.join(',').toLowerCase());
        }
      }

      // Make API call with filters
      const queryString = params.toString();
      const url = queryString ? `/api/admin/companies?${queryString}` : '/api/admin/companies';
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch filtered companies");

      const data: any[] = await res.json();
      set({ companies: data, filteredCompanies: data, loading: false });
      
    } catch (err: any) {
      console.error("applyFilters error:", err);
      toast.error("Failed to apply filters");
      set({ error: err.message, loading: false });
    }
  },

  resetFilters: async () => {
    const initialFilters = {
      status: [
        { id: "all", label: "All Status", checked: true },
        { id: "active", label: "Active", checked: false },
        { id: "follow-up", label: "Follow Up", checked: false },
        { id: "inactive", label: "Inactive", checked: false },
      ],
      owner: get().generateOwnerOptions(), // Use dynamic owner options
      tags: [
        { id: "all", label: "All Tags", checked: true },
        { id: "weblead", label: "Web Lead", checked: false },
        { id: "referral", label: "Referral", checked: false },
        { id: "vip", label: "VIP", checked: false },
        { id: "construction", label: "Construction", checked: false },
        { id: "architecture", label: "Architecture", checked: false },
      ],
    };
    set({ filters: initialFilters, searchTerm: "" });
    await get().fetchCompanies();
  },

  setSearchTerm: (search: string) => {
    set({ searchTerm: search });
    get().applyFilters();
  },
  fetchCompanies: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/companies${query}`);
      if (!res.ok) throw new Error("Failed to fetch companies");

      const data: Company[] = await res.json();
      set({ companies: data, loading: false });
      get().applyFilters(); // Apply filters after fetching data
    } catch (err: any) {
      console.error("fetchCompanies error:", err);
      toast.error("Failed to load companies");
      set({ error: err.message, loading: false });
    }
  },

  // Add a new company
  addCompany: async (company) => {
    try {
      const res = await fetch(`/api/admin/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create company");
      }

      const created: Company = await res.json();
      // Mirror customers pattern: keep server-created fields but inject owner from submitted payload
      set({ companies: [...get().companies, created] });
      get().applyFilters(); // Apply filters after adding company
    } catch (err: any) {
      console.error("addCompany error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // Update a company
  updateCompany: async (id, company) => {
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update company");
      }

      const updated: Company = await res.json();
      set({
        companies: get().companies.map((c: Company) => (c.id === id ? updated : c)),
      });
      get().applyFilters(); // Apply filters after updating company

    } catch (err: any) {
      console.error("updateCompany error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // Delete a company
  deleteCompany: async (id) => {
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete company");

      set({
        companies: get().companies.filter((c: Company) => c.id !== id),
      });
      get().applyFilters(); // Apply filters after deleting company
      toast.success("Company deleted successfully!");
    } catch (err: any) {
      console.error("deleteCompany error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // Export all companies to Excel
  exportAllCompanies: (filename?: string) => {
    const { filteredCompanies } = get();
    const result = exportCompaniesToExcel(filteredCompanies, filename);
    if (result.success) {
      toast.success(`Companies exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // Export selected companies to Excel
  exportSelectedCompanies: (companyIds: string[], filename?: string) => {
    const { companies } = get();
    const selectedCompanies = companies.filter(company => companyIds.includes(company.id));
    if (selectedCompanies.length === 0) {
      toast.error('No companies selected for export');
      return;
    }
    const result = exportCompaniesToExcel(selectedCompanies, filename);
    if (result.success) {
      toast.success(`Selected companies exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // Export single company to Excel
  exportSingleCompany: (companyId: string, filename?: string) => {
    const { companies } = get();
    const company = companies.find(c => c.id === companyId);
    if (!company) {
      toast.error('Company not found');
      return;
    }
    const result = exportSingleCompanyToExcel(company, filename);
    if (result.success) {
      toast.success(`Company ${company.fullName || 'Unknown'} exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // Export companies with custom columns
  exportCompaniesWithColumns: (columns: (keyof Company)[], filename?: string) => {
    const { companies } = get();
    const result = exportCompaniesWithColumns(companies, columns, filename);
    if (result.success) {
      toast.success(`Companies exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📥 Import companies from Excel
  importCompaniesFromExcel: async (file: File) => {
    try {
      const result = await importCompaniesFromExcel(file);
      
      if (!result.success) {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
        return;
      }

      if (!result.data || result.data.length === 0) {
        toast.error('No valid company data found in the file');
        return;
      }

      // Process each company through the API
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const companyData of result.data) {
        try {
          // Prepare company data with required fields
          const companyPayload = {
            ...companyData,
            // Ensure required fields have default values if missing
            industry: companyData.industry || 'Unknown Industry',
            status: companyData.status || 'Active',
            // Note: owner fields should be set by the API based on the authenticated user
          };


          const res = await fetch('/api/admin/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyPayload),
          });

          if (!res.ok) {
            const errorResponse = await res.json();
            console.error('API Error Response:', errorResponse);
            throw new Error(errorResponse.error || errorResponse.message || 'Failed to create company');
          }

          const created: Company = await res.json();
          // Add to local state
          set({ companies: [...get().companies, created] });
          successCount++;
        } catch (err: any) {
          errorCount++;
          const errorMessage = err.message || 'Unknown error';
          errors.push(`${companyData.fullName}: ${errorMessage}`);
          console.error(`Failed to import ${companyData.fullName}:`, err);
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} companies!`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} companies. Check console for details.`);
        console.error('Import errors:', errors);
      }

      // Show import warnings if any
      if (result.errors && result.errors.length > 0) {
        console.warn('Import warnings:', result.errors);
        toast(`Import completed with ${result.errors.length} warnings. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (err: any) {
      console.error('Import error:', err);
      toast.error('Failed to import companies from Excel file');
    }
  },

  // 📥 Download import template
  downloadImportTemplate: (filename?: string) => {
    const result = generateCompanyImportTemplate(filename);
    if (result.success) {
      toast.success('Import template downloaded successfully!');
    } else {
      toast.error(result.message);
    }
  },
}));