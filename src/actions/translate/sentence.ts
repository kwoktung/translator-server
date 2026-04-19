import { createServerOnlyFn } from '@tanstack/react-start'
import { getModelFor } from '#/utils/ai.server'
import { translateText } from '#/utils/llm/translate'
import { LANG_MAP } from '#/actions/translate/common'

export interface SentenceTranslateInput {
  text: string
  source: 'zh' | 'en'
  target: 'zh' | 'en'
}

export interface SentenceTranslateResult {
  translatedText: string
}

export const translateSentence = createServerOnlyFn(
  async (data: SentenceTranslateInput): Promise<SentenceTranslateResult> => {
    const model = getModelFor('translate')
    const translatedText = await translateText(model, {
      text: data.text,
      sourceLang: LANG_MAP[data.source],
      targetLang: LANG_MAP[data.target],
    })
    return { translatedText }
  },
)
