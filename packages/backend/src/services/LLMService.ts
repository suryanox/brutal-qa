import { generateText, generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { z } from 'zod'

function getModel() {
  const provider = process.env.LLM_PROVIDER ?? 'openai'
  const model = process.env.LLM_MODEL ?? 'gpt-4o'
  const baseUrl = process.env.LLM_BASE_URL

  switch (provider) {
    case 'anthropic':
      return createAnthropic()(model)
    case 'openai':
    default: {
      const openai = baseUrl
        ? createOpenAI({ baseURL: baseUrl })
        : createOpenAI()
      return openai(model)
    }
  }
}

export async function llmChat(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  options?: { tools?: Record<string, unknown> },
) {
  const res = await generateText({
    model: getModel(),
    system,
    messages,
    temperature: 0.3,
    ...(options?.tools ? { tools: options.tools as any } : {}),
  })
  return res.text
}

export async function llmObject<T>(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  schema: z.ZodType<T>,
): Promise<T> {
  const res = await generateObject({
    model: getModel(),
    system,
    messages,
    schema,
    temperature: 0.3,
  })
  return res.object
}
