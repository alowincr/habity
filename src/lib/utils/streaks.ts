export function calcularRacha(fechas: string[]): number {
  if (fechas.length === 0) return 0

  const sorted = [...fechas].map(f => {
    const [y, m, d] = f.split('-').map(Number)
    return new Date(y, m - 1, d)
  })

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)

  const primera = new Date(sorted[0])
  primera.setHours(0, 0, 0, 0)
  if (primera < ayer) return 0

  let racha = 1
  for (let i = 1; i < sorted.length; i++) {
    const actual   = new Date(sorted[i]);   actual.setHours(0,0,0,0)
    const anterior = new Date(sorted[i-1]); anterior.setHours(0,0,0,0)
    const diff = (anterior.getTime() - actual.getTime()) / 86400000
    if (diff === 1) racha++
    else break
  }
  return racha
}

export function calcularRachaMaxHistorica(fechas: string[]): number {
  if (fechas.length === 0) return 0
  const sorted = [...fechas].map(f => {
    const [y, m, d] = f.split('-').map(Number)
    return new Date(y, m - 1, d)
  })

  let max = 1, actual = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i].getTime() - sorted[i-1].getTime()) / 86400000
    if (diff === 1) { actual++; if (actual > max) max = actual }
    else actual = 1
  }
  return max
}

export function calcularTasaExito(fechas: string[], diasDesdeCreacion: number): number {
  if (diasDesdeCreacion === 0) return 0
  return Math.round((fechas.length / diasDesdeCreacion) * 100)
}