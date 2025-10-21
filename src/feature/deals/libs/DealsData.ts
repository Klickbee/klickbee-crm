export interface DealData {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost'
  amount: number
  owner: string
  ownerImage?: string
  activity?: string
  tags?: string
  date?: string 
  priority?: string
  notes?: string
  files?: { url: string; name?: string; size?: number; mimeType?: string }[];
}

