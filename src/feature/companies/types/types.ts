export type StatusType = 'Active' | 'Follow Up' | 'inactive';

export type Company = {
  id: string;
  industry?: string;
  website?: string;
  fullName?: string;  // Changed from companyname to match prisma schema
  email?: string;
  phone?: string;
 owner?: {
    id: string;
    name?: string;
    email: string;
  };   // Changed from string to object to match prisma relation
  ownerAvatar?: string;
  status?: StatusType;
  lastContact?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?:string
};
