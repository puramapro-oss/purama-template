import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { streamClaude } from '@/lib/claude'

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
  conversationId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 })

    const body = await req.json()
    const { messages, conversationId } = schema.parse(body)

    const systemPrompt = `Tu es {{APP_NAME}}, assistant IA de l'écosystème Purama. Tu es expert dans ton domaine. Réponds en français, de manière claire et structurée.`

    const lastUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? ''

    if (conversationId) {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', user.id)
    }

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamClaude(lastUserMessage, systemPrompt)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) return new Response(JSON.stringify({ error: 'Paramètres invalides' }), { status: 400 })
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 })
  }
}
