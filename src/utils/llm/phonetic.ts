import { generateText } from 'ai'
import Mustache from 'mustache'
import promptTemplate from './phonetic.mustache?raw'

type Model = Parameters<typeof generateText>[0]['model']

export async function getPhonetic(
  model: Model,
  params: { word: string },
): Promise<string> {
  const prompt = Mustache.render(promptTemplate, params)
  const { text } = await generateText({ model, prompt })
  return text.trim()
}
