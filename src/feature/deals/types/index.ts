
export type Deal = {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'New' | 'Contacted' | 'Proposal' | 'Won' | 'Lost'
  amount: number
  owner: string
  ownerImage?: string
  activity?: string
  tags?: string
  closeDate?: string
  priority?: string
  notes?: string
  attachments?: string[]
}

