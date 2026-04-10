import jsPDF from 'jspdf'

type Habit = {
  name: string
  racha: number
  completadoHoy: boolean
  category: string
  frequency: string
}

export function generarReportePDF(habits: Habit[], completadosHoy: number) {
  const doc = new jsPDF()

  const fecha = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const total = habits.length
  const porcentaje = total > 0
    ? Math.round((completadosHoy / total) * 100)
    : 0

  const rachaMax = total > 0
    ? Math.max(...habits.map(h => h.racha))
    : 0

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  function addFooter() {
    doc.setFontSize(8)
    doc.setTextColor(110, 110, 130)
    doc.text(
      'Generado con Habity — Construye mejores hábitos cada día',
      20,
      pageHeight - 10
    )
  }

  // =========================
  // HEADER
  // =========================
  doc.setFillColor(124, 111, 255)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.text('Habity', 20, 22)

  doc.setFontSize(10)
  doc.setTextColor(230, 230, 255)
  doc.text(`Reporte de progreso — ${fecha}`, 20, 30)

  // =========================
  // RESUMEN GENERAL
  // =========================
  doc.setFontSize(14)
  doc.setTextColor(30, 30, 50)
  doc.text('Resumen General', 20, 55)

  const summaryCards = [
    { label: 'Hábitos Totales', value: String(total) },
    { label: 'Completados Hoy', value: `${completadosHoy}/${total}` },
    { label: 'Progreso', value: `${porcentaje}%` },
    { label: 'Mejor Racha', value: `${rachaMax} días` },
  ]

  let cardX = 20
  summaryCards.forEach(card => {
    doc.setFillColor(248, 248, 252)
    doc.roundedRect(cardX, 65, 40, 24, 4, 4, 'F')

    doc.setFontSize(8)
    doc.setTextColor(120, 120, 140)
    doc.text(card.label, cardX + 4, 73)

    doc.setFontSize(14)
    doc.setTextColor(124, 111, 255)
    doc.text(card.value, cardX + 4, 83)

    cardX += 43
  })

  // =========================
  // BARRA DE PROGRESO
  // =========================
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 50)
  doc.text('Progreso Diario', 20, 105)

  doc.setFillColor(235, 235, 245)
  doc.roundedRect(20, 112, 170, 10, 3, 3, 'F')

  doc.setFillColor(124, 111, 255)
  doc.roundedRect(
    20,
    112,
    Math.max(5, (170 * porcentaje) / 100),
    10,
    3,
    3,
    'F'
  )

  doc.setFontSize(9)
  doc.setTextColor(124, 111, 255)
  doc.text(`${porcentaje}% completado`, 20, 128)

  // =========================
  // LISTA DE HÁBITOS
  // =========================
  doc.setFontSize(14)
  doc.setTextColor(30, 30, 50)
  doc.text('Detalle de Hábitos', 20, 145)

  let y = 155

  habits.forEach((habit, i) => {
    if (y > 260) {
      addFooter()
      doc.addPage()
      y = 20
    }

    const estado = habit.completadoHoy ? 'COMPLETADO' : 'PENDIENTE'

    const categoryMap: Record<string, string> = {
      salud: 'Salud',
      estudio: 'Estudio',
      hobby: 'Hobby',
      trabajo: 'Trabajo',
      general: 'General',
    }

    const freqMap: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
    }

    // Card fondo
    doc.setFillColor(250, 250, 255)
    doc.roundedRect(20, y - 6, 170, 20, 4, 4, 'F')

    // Nombre hábito
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 50)
    doc.text(`${estado} ${habit.name}`, 26, y)

    // Metadata
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 140)
    doc.text(
      `${categoryMap[habit.category] ?? 'General'} • ${freqMap[habit.frequency] ?? 'Diario'} • Racha: ${habit.racha} días`,
      26,
      y + 7
    )

    y += 26
  })

  addFooter()

  // =========================
  // SAVE
  // =========================
  doc.save(
    `habity-reporte-${new Date().toISOString().split('T')[0]}.pdf`
  )
}