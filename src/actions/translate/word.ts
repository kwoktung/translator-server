import { createServerOnlyFn } from '@tanstack/react-start'
import { getModelFor } from '#/utils/ai.server'
import { getWordAnalysis } from '#/utils/llm/word-analysis'
import { LANG_MAP } from '#/actions/translate/common'

export interface WordTranslateInput {
  word: string
  source: 'zh' | 'en'
  target: 'zh' | 'en'
}

export interface WordTranslateResult {
  word: string
  phonetic: string
  mnemonic: string
  example: string
  meaning: string
}

export const translateWord = createServerOnlyFn(
  async (data: WordTranslateInput): Promise<WordTranslateResult> => {
    const model = getModelFor('translate')
    const sourceLang = LANG_MAP[data.source]
    const targetLang = LANG_MAP[data.target]
    const { meaning, phonetic, example, mnemonic } = await getWordAnalysis(
      model,
      {
        word: data.word,
        sourceLang,
        targetLang,
      },
    )
    return { word: data.word, meaning, phonetic, example, mnemonic }
  },
)
