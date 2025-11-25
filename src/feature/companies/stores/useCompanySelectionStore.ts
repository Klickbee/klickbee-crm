import { create } from "zustand";

interface CompanySelectionState {
  selectedCompanyId: string;
  setSelectedCompany: (companyId: string) => void;
  clearSelectedCompany: () => void;
}

export const useCompanySelectionStore = create<CompanySelectionState>((set) => ({
  selectedCompanyId: "",
  setSelectedCompany: (companyId) => set({ selectedCompanyId: companyId }),
  clearSelectedCompany: () => set({ selectedCompanyId: "" }),
}));
