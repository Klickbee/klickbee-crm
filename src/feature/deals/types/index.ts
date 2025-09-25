export type Deal = {
  id: string
  dealName: string
  company: string
  contact: string
  stage: "new" | "contacted" | "proposal" | "won" | "lost"
  amount: number
  owner: string
  ownerImage?: string
  activity?: string
  tags?: string
  date?: string
  // allow any additional fields
  [key: string]: any
}