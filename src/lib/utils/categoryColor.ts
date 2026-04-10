export type CategoryStyle = {
  bg: string
  text: string
  label: string
}

const mapDark: Record<string, CategoryStyle> = {
  general: { bg: 'rgba(255,255,255,0.08)', text: '#a0a0b0', label: 'General' },
  salud:   { bg: 'rgba(52,211,153,0.12)',  text: '#34d399', label: 'Salud' },
  estudio: { bg: 'rgba(124,111,255,0.12)', text: '#7c6fff', label: 'Estudio' },
  hobby:   { bg: 'rgba(251,146,60,0.12)',  text: '#fb923c', label: 'Hobby' },
  trabajo: { bg: 'rgba(96,165,250,0.12)',  text: '#60a5fa', label: 'Trabajo' },
}

const mapLight: Record<string, CategoryStyle> = {
  general: { bg: 'rgba(0,0,0,0.06)',       text: '#6b6b80', label: 'General' },
  salud:   { bg: 'rgba(5,150,105,0.1)',    text: '#059669', label: 'Salud' },
  estudio: { bg: 'rgba(99,85,232,0.1)',    text: '#6355e8', label: 'Estudio' },
  hobby:   { bg: 'rgba(217,119,6,0.1)',    text: '#d97706', label: 'Hobby' },
  trabajo: { bg: 'rgba(37,99,235,0.1)',    text: '#2563eb', label: 'Trabajo' },
}

export function getCategoryStyle(category: string, theme: 'dark' | 'light' = 'dark'): CategoryStyle {
  const map = theme === 'dark' ? mapDark : mapLight
  return map[category] ?? map['general']
}