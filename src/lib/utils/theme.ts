export function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem('habity-theme') as 'dark' | 'light') ?? 'dark'
}

export function setTheme(theme: 'dark' | 'light') {
  localStorage.setItem('habity-theme', theme)
}

export const themes = {
  dark: {
    bg:         '#0f0f13',
    bgCard:     'rgba(255,255,255,0.02)',
    bgCardHov:  'rgba(255,255,255,0.04)',
    border:     'rgba(255,255,255,0.05)',
    borderHov:  'rgba(255,255,255,0.1)',
    text:       '#f0f0fa',
    textMuted:  '#6b6b80',
    textFaint:  '#4a4a5a',
    accent:     '#7c6fff',
    accentBg:   'rgba(124,111,255,0.1)',
    accentBorder:'rgba(124,111,255,0.2)',
    green:      '#34d399',
    greenBg:    'rgba(52,211,153,0.08)',
    orange:     '#fb923c',
    red:        '#ff6b6b',
    blue:       '#60a5fa',
    gradient:   'linear-gradient(135deg, #7c6fff, #a855f7)',
    inputBg:    'rgba(255,255,255,0.04)',
    radial:     'radial-gradient(ellipse at 60% 0%, #1e1040 0%, #0f0f13 60%)',
  },
  light: {
    bg:         '#f4f4f8',
    bgCard:     '#ffffff',
    bgCardHov:  '#f9f9fc',
    border:     'rgba(0,0,0,0.07)',
    borderHov:  'rgba(0,0,0,0.15)',
    text:       '#1a1a2e',
    textMuted:  '#6b6b80',
    textFaint:  '#9090a0',
    accent:     '#6355e8',
    accentBg:   'rgba(99,85,232,0.08)',
    accentBorder:'rgba(99,85,232,0.2)',
    green:      '#059669',
    greenBg:    'rgba(5,150,105,0.08)',
    orange:     '#d97706',
    red:        '#dc2626',
    blue:       '#2563eb',
    gradient:   'linear-gradient(135deg, #6355e8, #9333ea)',
    inputBg:    'rgba(0,0,0,0.03)',
    radial:     'radial-gradient(ellipse at 60% 0%, #ede9fe 0%, #f4f4f8 60%)',
  },
}