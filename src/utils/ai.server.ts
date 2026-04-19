import type { LanguageModel } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { getEnv } from '#/env.server'

const MODELS: Record<string, () => LanguageModel> = {
  translate: () =>
    createWorkersAI({ binding: getEnv().AI })('@cf/meta/llama-3.1-8b-instruct'),
  writingCoach: () =>
    createWorkersAI({ binding: getEnv().AI })('@cf/moonshotai/kimi-k2.5'),
}

export function getModelFor(name: keyof typeof MODELS): LanguageModel {
  return MODELS[name]()
}
