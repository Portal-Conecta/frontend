'use client'

import { FillChecklistPage } from '@portal/checklist'
import { use } from 'react'

// mock 
const header = {
  room: '204 - Laboratório de Informática',
  checklistType: 'Checklist de entrada',
  group: 'MIDS -78',
  filledBy: 'Letícia Emanuele Güths',
}

const items = [
  { id: '1', title: 'Ar Condicionado', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '2', title: 'Computadores', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '3', title: 'Periféricos', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '4', title: 'Mesas', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '5', title: 'Cadeiras', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '6', title: 'Portas e janelas', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '7', title: 'Paredes e piso', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '8', title: 'Limpeza e organização', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
]

export default function PreencherChecklistRoute({
  params,
}: {
  params: Promise<{ salaId: string }>
}) {
  const { salaId } = use(params)

  return (
    <FillChecklistPage
      header={header}
      items={items}
      onSubmit={(answers) => console.log('enviar checklist', salaId, answers)}
    />
  )
}