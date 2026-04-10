import themeInitScript from './theme-init.js?raw'

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
}
