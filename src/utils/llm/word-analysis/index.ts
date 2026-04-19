import { generateText } from 'ai'
import Mustache from 'mustache'
import examplePrompt from './example.mustache?raw'
import meaningPrompt from './meaning.mustache?raw'
import mnemonicPrompt from './mnemonic.mustache?raw'
import phoneticPrompt from './phonetic.mustache?raw'

type Model = Parameters<typeof generateText>[0]['model']

export async function getWordAnalysis(
  model: Model,
  params: { word: string; sourceLang: string; targetLang: string },
): Promise<{
  meaning: string
  phonetic: string
  example: string
  mnemonic: string
}> {
  const [meaning, phonetic, example, mnemonic] = await Promise.all([
    generateText({
      model,
      prompt: Mustache.render(meaningPrompt, params),
    }).then((r) => r.text.trim()),
    generateText({
      model,
      prompt: Mustache.render(phoneticPrompt, params),
    }).then((r) => r.text.trim()),
    generateText({
      model,
      prompt: Mustache.render(examplePrompt, params),
    }).then((r) => r.text.trim()),
    generateText({
      model,
      prompt: Mustache.render(mnemonicPrompt, params),
    }).then((r) => r.text.trim()),
  ])
  return { meaning, phonetic, example, mnemonic }
}
