import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://zenquotes.io/api/today', {
      next: { revalidate: 3600 }, // 🔥 cache 1 hora
    })

    const data = await res.json()

    return NextResponse.json({
      quote: data[0].q,
      author: data[0].a,
    })
  } catch {
    return NextResponse.json({
      quote: 'Cada día es una nueva oportunidad para mejorar.',
      author: 'Habity',
    })
  }
}