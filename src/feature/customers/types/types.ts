export type Customer = {
  id: string;
  userId: string;
  fullName: string;
  company: string | { fullName: string };
  email?: string;
  phone?: string;
  status: 'Active' | 'FollowUp' | 'inactive';
  lastContact?: string;
  tags: string[];
  notes?: string;
  files?: Array<{ url: string; name: string; size: number }>;
  ownerId: string;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};
