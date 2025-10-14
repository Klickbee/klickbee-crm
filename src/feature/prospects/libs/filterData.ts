export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

export interface FilterData {
  status: FilterOption[];
  owner: FilterOption[];
  tags: FilterOption[];
}

export const filterData: FilterData = {
  status: [
    { id: "all", label: "All Status", checked: true },
    { id: "new", label: "New", checked: false },
    { id: "Cold", label: "Cold", checked: false },
    { id: "Qualified", label: "Qualified", checked: false },
    { id: "Warmlead", label: "Warm-lead", checked: false },
    { id: "converted", label: "Converted", checked: false },
    { id: "notintrested", label: "Not-intrested", checked: false },
  ],

  owner: [
    { id: "all", label: "All Owner", checked: true },
    { id: "me", label: "Me", checked: false },
    { id: "jean", label: "Jean Dubois", checked: false },
    { id: "emile", label: "Émile Dupont", checked: false },
    { id: "claire", label: "Claire Martin", checked: false },
    { id: "antoine", label: "Antoine Lefevre", checked: false },
    { id: "sophie", label: "Sophie Bernard", checked: false },
  ],

  tags: [
    { id: "all", label: "All Tags", checked: true },
    { id: "weblead", label: "Web Lead", checked: false },
    { id: "referral", label: "Referral", checked: false },
    { id: "vip", label: "VIP", checked: false },
    { id: "construction", label: "Construction", checked: false },
    { id: "architecture", label: "Architecture", checked: false },
  ],
};