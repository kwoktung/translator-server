import { generateText, Output } from 'ai'
import Mustache from 'mustache'
import { z } from 'zod'
import promptTemplate from './prompt.mustache?raw'

type Model = Parameters<typeof generateText>[0]['model']

export const writingFeedbackSchema = z.object({
  revised: z
    .string()
    .describe('The corrected and polished version of the text'),
  suggestions: z
    .array(z.string())
    .max(3)
    .describe(
      'Actionable suggestions, grammar issues first, then clarity and style',
    ),
})

export type WritingFeedbackOutput = z.infer<typeof writingFeedbackSchema>

export async function getWritingFeedback(
  model: Model,
  params: { text: string },
): Promise<WritingFeedbackOutput> {
  const prompt = Mustache.render(promptTemplate, params)
  const result = await generateText({
    model,
    output: Output.object({ schema: writingFeedbackSchema }),
    prompt,
  })
  return result.output
}
