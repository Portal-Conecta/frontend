import { NextResponse } from 'next/server'
import {
  searchTemplateItems,
  searchTemplateItemsByCategory,
} from '@portal/checklist/services/server/templateService'
import { bffErrorResponse } from '../../../_lib/bffError'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const category = searchParams.get('category')

    if (query) {
      return NextResponse.json(await searchTemplateItems(query))
    }
    if (category) {
      return NextResponse.json(await searchTemplateItemsByCategory(category))
    }
    
    return NextResponse.json(
      { code: 'bad_request', message: 'informe query ou category' }, 
      { status: 400 }
    )
  } catch (err) {
    return bffErrorResponse(err)
  }
}