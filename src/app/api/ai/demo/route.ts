import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { askClaude } from '@/lib/claude'

const schema = z.object({ message: z.string().min(1).max(500) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = schema.parse(body)

    const systemPrompt = `Tu es {{APP_NAME}}, assistant IA de l'écosystème Purama. Mode démo: donne un aperçu de tes capacités en 2-3 phrases. Réponds en français.`

    const response = await askClaude(message, systemPrompt, 'fast')

    return NextResponse.json({ response })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Message invalide' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
