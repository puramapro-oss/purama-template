/**
 * {{APP_NAME}} — Anthropic client wrapper.
 *
 * Trois variantes par défaut (via env, jamais hardcodé) :
 *   - MAIN  : claude-sonnet-4-6      → IA conversationnelle, génération
 *   - FAST  : claude-haiku-4-5       → tri, détection langue, micro-tâches
 *   - PRO   : claude-opus-4-7        → analyses critiques (rare)
 *
 * IMPORTANT (CLAUDE.md §14) :
 *   - L'IA ne dit JAMAIS qu'elle est Claude/Anthropic.
 *   - Elle s'identifie comme "{{APP_NAME}}" — son persona est défini dans le
 *     systemPrompt côté caller (à adapter selon le domaine de l'app).
 */

import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquant — la couche IA ne peut pas démarrer.");
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export type ClaudeTier = "main" | "fast" | "pro";

function getModelId(tier: ClaudeTier): string {
  if (tier === "fast") return process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001";
  if (tier === "pro") return process.env.ANTHROPIC_MODEL_PRO ?? "claude-opus-4-7";
  return process.env.ANTHROPIC_MODEL_MAIN ?? "claude-sonnet-4-6";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AskClaudeOptions {
  tier?: ClaudeTier;
  systemPrompt: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function askClaude(opts: AskClaudeOptions): Promise<string> {
  const client = getClient();
  const model = getModelId(opts.tier ?? "main");
  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    system: opts.systemPrompt,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const block = response.content[0];
  if (block && block.type === "text") return block.text;
  return "";
}

export async function askClaudeJSON<T>(
  opts: AskClaudeOptions & { schemaHint: string }
): Promise<T> {
  const enrichedSystem = `${opts.systemPrompt}\n\nIMPORTANT: réponds UNIQUEMENT avec un JSON valide qui matche ce schéma :\n${opts.schemaHint}\nAucun texte avant ou après. Pas de markdown. Pas de \`\`\`.`;
  const text = await askClaude({ ...opts, systemPrompt: enrichedSystem });
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("Réponse IA non-parsable en JSON. Réessaie ou contacte le support.");
  }
}

/**
 * Stream une réponse Claude. Retourne un AsyncIterable<string> des deltas texte.
 * Compatible avec les SSE Next.js Route Handlers.
 */
export async function* streamClaude(opts: AskClaudeOptions): AsyncGenerator<string> {
  const client = getClient();
  const model = getModelId(opts.tier ?? "main");
  const stream = await client.messages.stream({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    system: opts.systemPrompt,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

/**
 * Persona par défaut — à overrider dans chaque app selon le domaine.
 * Exemple : trading → "tu es un trader avec 15 ans d'expérience..."
 */
export const DEFAULT_SYSTEM_PROMPT = `Tu es {{APP_NAME}}, un compagnon expert dans ton domaine.
Tu tutoies l'utilisateur, tu es chaleureux mais professionnel.
Tu réponds en français par défaut. Tu utilises des emojis avec parcimonie.
Tu ne dis JAMAIS que tu es Claude, Anthropic, ou une IA — tu es {{APP_NAME}}.
Tu refuses poliment toute demande hors de ton domaine d'expertise.`;
