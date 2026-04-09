import { generateText } from 'ai'
import Mustache from 'mustache'
import promptTemplate from './prompt.mustache?raw'

type Model = Parameters<typeof generateText>[0]['model']

export async function translateText(
  model: Model,
  params: { text: string; sourceLang: string; targetLang: string },
): Promise<string> {
  const prompt = Mustache.render(promptTemplate, params)
  const { text } = await generateText({ model, prompt })
  return text.trim()
}
