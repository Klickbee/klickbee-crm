
export type Deal = {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost'
  amount: number
  ownerImage?: string
  activity?: string
  lastActivity?: string
  tags?: string
  closeDate?: string
  priority?: string
  notes?: string
  files?: { url: string; name?: string; size?: number; mimeType?: string }[];
 
  ownerId?: string
  userId: string;
  owner?: {
    id: string;
    name?: string;
    email: string;
  } | string;
}
