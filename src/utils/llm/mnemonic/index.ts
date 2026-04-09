import { generateText } from 'ai'
import Mustache from 'mustache'
import promptTemplate from './prompt.mustache?raw'

type Model = Parameters<typeof generateText>[0]['model']

export async function getMnemonic(
  model: Model,
  params: { word: string; sourceLang: string },
): Promise<string> {
  const prompt = Mustache.render(promptTemplate, params)
  const { text } = await generateText({ model, prompt })
  return text.trim()
}
