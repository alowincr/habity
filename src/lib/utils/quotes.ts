export async function obtenerFrase(): Promise<{ quote: string; author: string }> {
  try {
    const res = await fetch('/api/quote')
    return await res.json()
  } catch {
    return {
      quote: 'Cada día es una nueva oportunidad para mejorar.',
      author: 'Habity',
    }
  }
}