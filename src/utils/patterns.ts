export function isEnglishWord(text: string): boolean {
  return /^[a-zA-Z]+(-[a-zA-Z]+)*$/.test(text)
}
