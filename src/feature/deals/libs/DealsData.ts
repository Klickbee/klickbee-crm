export interface DealData {
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
  date?: string 
  priority?: string
  notes?: string
  attachments?: string[]
}

export const dealsData: DealData[] = [
  {
    id: '1',
    dealName: 'Maison Dupont - Construction',
    company: 'SARL Dumas',
    contact: 'Marc Dupont',
    stage: 'New',
    amount: 18400,
    owner: 'Thomas Dad.',
    ownerImage: 'https://i.pravatar.cc/32?img=1',
    activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority',
    notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ,attachments: ['Attached_file_2024.pdf', 'Site_plan.png']

  },
  {
    id: '2',
    dealName: 'Projet Alpha - Design Phase',
    company: 'La Fabrique',
    contact: 'Julien Perrot',
    stage: 'Contacted',
    amount: 12700,
    owner: 'Claire Brunet..',
    ownerImage: 'https://i.pravatar.cc/32?img=2',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
     date : '15 Sep,2025',
    priority: 'VIP, High Priority',
 notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
 attachments: ['contract_draft.docx']

  },
  {
    id: '3',
    dealName: 'Résidence Moreau',
    company: 'AEC Partners',
    contact: 'Isabelle Moreau',
    stage: 'Proposal',
    amount: 24900,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=3',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
     notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']

  },
  {
    id: '4',
    dealName: 'Projet Résidence Rennes',
    company: 'Indépendant',
    contact: 'Marc Lefebvre',
    stage: 'Won',
    amount: 8000,
    owner: 'Claire Brunet',
    ownerImage: 'https://i.pravatar.cc/32?img=4',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
      notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']                
  },
  {
    id: '5',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'Lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=5',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
      notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']
  },
  {
    id: '6',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'Lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=6',
    //  activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
      notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']
  },
  {
    id: '7',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'Lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=7',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
      notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']
  },
  {
    id: '8',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'Lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=8',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
      notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']
  },
  {
    id: '9',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'Lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=9',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
      notes:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']
  },
  {
    id: '10',
    dealName: 'Villa Leclerc - Phase 2',
    company: 'Groupe Orion',
    contact: 'Sophie Lambert',
    stage: 'Lost',
    amount: 42500,
    owner: 'Thomas De...',
    ownerImage: 'https://i.pravatar.cc/32?img=10',
     activity: ' call-2 days' ,
    tags:'Desing,B2B',
    date : '15 Sep,2025',
    priority: 'VIP, High Priority',
    attachments: ['attached_file_2024.pdf', 'site_plan.png']
  },
]
