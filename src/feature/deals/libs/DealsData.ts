export interface DealData {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'new' | 'contacted' | 'proposal' | 'won' | 'lost'
  amount: number
  owner: string
  ownerImage?: string
  activity ? :string
  tags ?:string
  date ?:string 
  priority? : string
}

export const dealsData: DealData[] = [
  {
    id: '1',
    dealName: 'Maison Dupont - Construction',
    company: 'SARL Dumas',
    contact: 'Marc Dupont',
    stage: 'new',
    amount: 18400,
    owner: 'Thomas Dad.',
    ownerImage: 'https://i.pravatar.cc/32?img=1',
    activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '2',
    dealName: 'Projet Alpha - Design Phase',
    company: 'La Fabrique',
    contact: 'Julien Perrot',
    stage: 'contacted',
    amount: 12700,
    owner: 'Claire Brunet..',
    ownerImage: 'https://i.pravatar.cc/32?img=2',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
     date : '15 Sep,2025',
    priority: 'VIP, High Priority'


  },
  {
    id: '3',
    dealName: 'Résidence Moreau',
    company: 'AEC Partners',
    contact: 'Isabelle Moreau',
    stage: 'proposal',
    amount: 24900,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=3',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'

  },
  {
    id: '4',
    dealName: 'Projet Résidence Rennes',
    company: 'Indépendant',
    contact: 'Marc Lefebvre',
    stage: 'won',
    amount: 8000,
    owner: 'Claire Brunet',
    ownerImage: 'https://i.pravatar.cc/32?img=4',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '5',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=5',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '6',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=6',
    //  activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '7',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=7',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '8',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=8',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '9',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=9',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
  {
    id: '10',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=10',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority'
  },
]
