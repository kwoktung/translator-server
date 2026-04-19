export function isEnglishWord(text: string): boolean {
  return /^[a-zA-Z]+(-[a-zA-Z]+)*$/.test(text)
}

export function isEnglishPhrase(text: string): boolean {
  return (
    text.length > 0 &&
    text.length <= 500 &&
    /^[a-zA-Z][a-zA-Z\s\-',.!?;:]*$/.test(text)
  )
}
