
export type Deal = {
  id: string
  dealName: string
  company?: {
    id: string
    fullName: string
    industry?: string
    email?: string
    phone?: string
    website?: string
    status?: string
  } | string
  contact?: {
    id: string
    fullName: string
    email?: string
    phone?: string
    company?: {
      id: string
      fullName: string
    }
  } | string
  stage: 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost'
  amount: number
  currency?: string
  ownerImage?: string
  activity?: string
  lastActivity?: string
  tags?: string[]
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
