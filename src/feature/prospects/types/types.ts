export type Prospect = {
  id: string;
  fullName: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  status: 'New' | 'Cold' | 'Qualified' | 'Warmlead' | 'Converted' | 'Notintrested';
  tags?: string[];
  notes?: string | null;
  files?: Array<{ url: string; name: string; size: number }>;
  ownerId: string;
  userId: string;
  owner?: {
    id: string;
    name?: string;
    email: string;
  } | string; // Can be either User object (from API) or string (processed)
  ownerAvatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Contact = {
  id: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
  ownerAvatar?: string;
  status?:
    | 'New'
    | 'Cold'
    | 'Warm Lead'
    | 'Qualified'
    | 'Converted'
    | 'Not Interested';
  lastContact?: string;
  tags?: string;
};
