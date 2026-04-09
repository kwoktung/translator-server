import { useCallback, useRef, useState } from 'react'

type AudioState = 'idle' | 'loading' | 'playing'

export function useAudioPlay() {
  const [state, setState] = useState<AudioState>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setState('loading')
    const audio = new Audio(url)
    audioRef.current = audio
    audio.addEventListener('playing', () => setState('playing'))
    audio.addEventListener('ended', () => setState('idle'))
    audio.addEventListener('error', () => setState('idle'))
    audio.play().catch(() => setState('idle'))
  }, [])

  return { loading: state === 'loading', playing: state === 'playing', play }
}
