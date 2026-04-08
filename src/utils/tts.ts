export async function speakText(text: string): Promise<void> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('TTS request failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audioEl = new Audio(url)
  audioEl.onended = () => URL.revokeObjectURL(url)
  audioEl.play()
}
