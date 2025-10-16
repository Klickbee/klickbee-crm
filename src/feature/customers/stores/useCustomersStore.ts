import { create } from "zustand";
import toast from "react-hot-toast";
import { Customer } from "../types/types";
import { exportCustomersToExcel, exportCustomersWithColumns, exportSingleCustomerToExcel } from "../libs/excelExport";
import { importCustomersFromExcel, generateCustomerImportTemplate } from "../libs/excelImport";
import { FilterData } from "../libs/fillterData";
import { useUserStore } from "../../user/store/userStore";

interface CustomerStore {
  customers: Customer[];
  filteredCustomers: Customer[];
  loading: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  isExporting: boolean;
  error: string | null;
  filters: FilterData;

  fetchCustomers: (ownerId?: string) => Promise<void>;
  setFilters: (filters: FilterData) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  generateOwnerOptions: () => any[];
  initializeOwnerOptions: () => void;
  addCustomer: (customer: Omit<Customer, "id" | "ownerId" | "createdAt">) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  exportAllCustomers: (filename?: string) => void;
  exportSelectedCustomers: (customerIds: string[], filename?: string) => void;
  exportSingleCustomer: (customerId: string, filename?: string) => void;
  exportCustomersWithColumns: (columns: (keyof Customer)[], filename?: string) => void;
  importCustomersFromExcel: (file: File) => Promise<void>;
  downloadImportTemplate: (filename?: string) => void;
}

export const useCustomersStore = create<CustomerStore>((set, get) => ({
  customers: [],
  filteredCustomers: [],
  loading: false,
  isDeleting: false,
  isEditing: false,
  isExporting: false,
  error: null,
  filters: {
    status: [
      { id: "all", label: "All Status", checked: true },
      { id: "active", label: "Active", checked: false },
      { id: "follow-up", label: "Follow Up", checked: false },
      { id: "inactive", label: "Inactive", checked: false },
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

  // Helper: build owner options from users
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

  // Initialize owner options
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
    const { customers, filters } = get();
    let filtered = [...customers];

    // Status filter
    const activeStatus = filters.status.filter((s: any) => s.checked && s.id !== "all");
    if (activeStatus.length > 0) {
      filtered = filtered.filter((customer: Customer) =>
        activeStatus.some((f: any) => {
          if (f.id === "active") return customer.status === "Active";
          if (f.id === "follow-up") return customer.status === "FollowUp";
          if (f.id === "inactive") return customer.status === "inactive";
          return false;
        })
      );
    }

    // Owner filter
    const activeOwners = filters.owner.filter((o: any) => o.checked && o.id !== "all");
    if (activeOwners.length > 0) {
      filtered = filtered.filter((customer: Customer) =>
        activeOwners.some((f: any) => {
          if (f.id === "me") {
            // TODO: Replace with actual current user id if available
            return customer.owner?.id === "current-user-id";
          }
          return customer.owner?.id === f.id;
        })
      );
    }

    // Tags filter (customer.tags is string[])
    const activeTags = filters.tags.filter((t: any) => t.checked && t.id !== "all");
    if (activeTags.length > 0) {
      filtered = filtered.filter((customer: Customer) => {
        const tags = (customer.tags || []).map((t) => t.toLowerCase());
        return activeTags.some((f: any) => tags.includes(f.label.toLowerCase()));
      });
    }

    set({ filteredCustomers: filtered });
  },

  resetFilters: () => {
    const initial = {
      status: [
        { id: "all", label: "All Status", checked: true },
        { id: "active", label: "Active", checked: false },
        { id: "follow-up", label: "Follow Up", checked: false },
        { id: "inactive", label: "Inactive", checked: false },
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
    set({ filters: initial, filteredCustomers: get().customers });
  },

  // 🧠 Fetch customers from API
  fetchCustomers: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/customers${query}`);
      if (!res.ok) throw new Error("Failed to fetch customers");

      const data: Customer[] = await res.json();
      set({ customers: data, loading: false });
      get().applyFilters();
    } catch (err: any) {
      console.error("fetchCustomers error:", err);
      toast.error("Failed to load customers");
      set({ error: err.message, loading: false });
    }
  },

  // ➕ Add a new customer
  addCustomer: async (customer) => {
    try {
      const res = await fetch(`/api/admin/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create customer");
      }

      const created: Customer = await res.json();
      set({ customers: [...get().customers, {...created, owner:{id: customer.owner?.id, name: customer.owner?.name, email: customer.owner?.email}}] });
      get().applyFilters();
      toast.success("Customer created successfully!");
    } catch (err: any) {
      console.error("addCustomer error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // ✏️ Update a customer
  updateCustomer: async (id, customer) => {
    set({ isEditing: true });
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update customer");
      }

      const updated: Customer = await res.json();
      set({
        customers: get().customers.map((c) => (c.id === id ? updated : c)),
      });
      get().applyFilters();

    } catch (err: any) {
      console.error("updateCustomer error:", err);
      toast.error(err.message);
      set({ error: err.message });
    } finally {
      set({ isEditing: false });
    }
  },

  // ❌ Delete a customer
  deleteCustomer: async (id) => {
    set({ isDeleting: true });
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete customer");

      set({
        customers: get().customers.filter((c) => c.id !== id),
      });
      get().applyFilters();
      toast.success("Customer deleted successfully!");
    } catch (err: any) {
      console.error("deleteCustomer error:", err);
      toast.error(err.message);
      set({ error: err.message });
    } finally {
      set({ isDeleting: false });
    }
  },

 // 📊 Export all customers to Excel (use filtered)
  exportAllCustomers: (filename?: string) => {
    const { filteredCustomers } = get();
    const result = exportCustomersToExcel(filteredCustomers, filename);
    if (result.success) {
      toast.success(`Customers exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export selected customers to Excel
  exportSelectedCustomers: (customerIds: string[], filename?: string) => {
    const { customers } = get();
    const selectedCustomers = customers.filter(customer => customerIds.includes(customer.id));
    if (selectedCustomers.length === 0) {
      toast.error('No customers selected for export');
      return;
    }
    const result = exportCustomersToExcel(selectedCustomers, filename);
    if (result.success) {
      toast.success(`Selected customers exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export single customer to Excel
  exportSingleCustomer: (customerId: string, filename?: string) => {
    const { customers } = get();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      toast.error('Customer not found');
      return;
    }
    const result = exportSingleCustomerToExcel(customer, filename);
    if (result.success) {
      toast.success(`Customer ${customer.fullName} exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📊 Export customers with custom columns
  exportCustomersWithColumns: (columns: (keyof Customer)[], filename?: string) => {
    const { customers } = get();
    const result = exportCustomersWithColumns(customers, columns, filename);
    if (result.success) {
      toast.success(`Customers exported successfully!`);
    } else {
      toast.error(result.message);
    }
  },

  // 📥 Import customers from Excel
  importCustomersFromExcel: async (file: File) => {
    try {
      const result = await importCustomersFromExcel(file);
      
      if (!result.success) {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
        return;
      }

      if (!result.data || result.data.length === 0) {
        toast.error('No valid customer data found in the file');
        return;
      }

      // Process each customer through the API
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const customerData of result.data) {
        try {
          // Prepare customer data with required fields
          const customerPayload = {
            ...customerData,
            // Ensure required fields have default values if missing
            company: customerData.company || 'Unknown Company',
            status: customerData.status || 'Active',
            tags: customerData.tags 
              ? (typeof customerData.tags === 'string' 
                  ? (customerData.tags as string).split(',').map((t: string) => t.trim()) 
                  : customerData.tags as string[])
              : [],
            // Note: userId and ownerId should be set by the API based on the authenticated user
          };

          console.log('Importing customer:', customerPayload);

          const res = await fetch('/api/admin/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerPayload),
          });

          if (!res.ok) {
            const errorResponse = await res.json();
            console.error('API Error Response:', errorResponse);
            throw new Error(errorResponse.error || errorResponse.message || 'Failed to create customer');
          }

          const created: Customer = await res.json();
          // Add to local state
          set({ customers: [...get().customers, created] });
          successCount++;
        } catch (err: any) {
          errorCount++;
          const errorMessage = err.message || 'Unknown error';
          errors.push(`${customerData.fullName}: ${errorMessage}`);
          console.error(`Failed to import ${customerData.fullName}:`, err);
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} customers!`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} customers. Check console for details.`);
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
      toast.error('Failed to import customers from Excel file');
    }
  },

  // 📥 Download import template
  downloadImportTemplate: (filename?: string) => {
    const result = generateCustomerImportTemplate(filename);
    if (result.success) {
      toast.success('Import template downloaded successfully!');
    } else {
      toast.error(result.message);
    }
  },
}));