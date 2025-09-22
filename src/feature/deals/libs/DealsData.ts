export interface DealData {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'new' | 'contacted' | 'proposal' | 'won' | 'lost'
  amount: number
  owner: string
}

export const dealsData: DealData[] = [
  {
    id: '1',
    dealName: 'Maison Dupont - Construction',
    company: 'SARL Dumas',
    contact: 'Marc Dupont',
    stage: 'new',
    amount: 18400,
    owner: 'Thomas Dad.'
  },
  {
    id: '2',
    dealName: 'Projet Alpha - Design Phase',
    company: 'La Fabrique',
    contact: 'Julien Perrot',
    stage: 'contacted',
    amount: 12700,
    owner: 'Claire Brunetncdnncdnnd'
  },
  {
    id: '3',
    dealName: 'Résidence Moreau',
    company: 'AEC Partners',
    contact: 'Isabelle Moreau',
    stage: 'proposal',
    amount: 24900,
    owner: 'Thomas De...'
  },
  {
    id: '4',
    dealName: 'Projet Résidence Rennes',
    company: 'Indépendant',
    contact: 'Marc Lefebvre',
    stage: 'won',
    amount: 8000,
    owner: 'Claire Brunet'
  },
  {
    id: '5',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...'
  }
]
