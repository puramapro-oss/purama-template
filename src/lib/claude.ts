import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODELS = {
  main: process.env.ANTHROPIC_MODEL_MAIN ?? 'claude-sonnet-4-6',
  fast: process.env.ANTHROPIC_MODEL_FAST ?? 'claude-haiku-4-5-20251001',
  pro: process.env.ANTHROPIC_MODEL_PRO ?? 'claude-opus-4-7',
}

export type ClaudeTier = keyof typeof MODELS

export async function askClaude(
  prompt: string,
  systemPrompt?: string,
  tier: ClaudeTier = 'main'
): Promise<string> {
  const response = await client.messages.create({
    model: MODELS[tier],
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected Claude response type')
  }

  return content.text
}

export async function* streamClaude(
  prompt: string,
  systemPrompt?: string,
  tier: ClaudeTier = 'main'
): AsyncGenerator<string, void, unknown> {
  const stream = await client.messages.stream({
    model: MODELS[tier],
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}

export async function askClaudeJSON<T = unknown>(
  prompt: string,
  systemPrompt?: string,
  tier: ClaudeTier = 'main'
): Promise<T> {
  const text = await askClaude(prompt, systemPrompt, tier)
  return JSON.parse(text) as T
}
