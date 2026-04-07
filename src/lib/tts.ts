import { ttsFn } from '#/actions/tts'

export async function speakText(text: string): Promise<void> {
  const { audio } = await ttsFn({ data: { text } })
  const binaryStr = atob(audio)
  const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  const audioEl = new Audio(url)
  audioEl.onended = () => URL.revokeObjectURL(url)
  audioEl.play()
}
