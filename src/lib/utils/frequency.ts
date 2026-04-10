export function estaCumplido(fechas: string[], frequency: string): boolean {
  const hoy = new Date().toLocaleDateString('en-CA')

  if (frequency === 'daily') {
    return fechas.includes(hoy)
  }

  if (frequency === 'weekly') {
    const ahora = new Date()
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - ahora.getDay())
    const inicioStr = inicioSemana.toISOString().split('T')[0]
    return fechas.some(f => f >= inicioStr && f <= hoy)
  }

  return false
}