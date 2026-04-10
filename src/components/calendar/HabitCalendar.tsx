'use client'

import { useState } from 'react'

type DayData = {
  date: string
  total: number
  completed: number
  notes: { habit: string; note: string }[]
}

type Props = {
  data: DayData[]
  theme: 'dark' | 'light'
}

export default function HabitCalendar({ data, theme }: Props) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const t = theme === 'dark'
  const cardBg     = t ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const border     = t ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textPrimary = t ? '#f0f0fa' : '#1a1a2e'
  const textMuted   = t ? '#6b6b80' : '#9090a0'
  const cellBg      = t ? 'rgba(255,255,255,0.03)' : '#f4f4f8'

  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = currentMonth.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  const dataMap: Record<string, DayData> = {}
  data.forEach(d => { dataMap[d.date] = d })

  function getDayColor(d: DayData | undefined): string {
    if (!d || d.total === 0) return 'transparent'
    const ratio = d.completed / d.total
    if (ratio === 0)   return t ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
    if (ratio < 0.5)   return t ? 'rgba(251,146,60,0.2)'  : 'rgba(217,119,6,0.2)'
    if (ratio < 1)     return t ? 'rgba(251,146,60,0.4)'  : 'rgba(217,119,6,0.4)'
    return t ? 'rgba(52,211,153,0.3)' : 'rgba(5,150,105,0.25)'
  }

  function getDayBorder(d: DayData | undefined): string {
    if (!d || d.total === 0) return 'transparent'
    const ratio = d.completed / d.total
    if (ratio === 0)   return 'transparent'
    if (ratio < 1)     return t ? 'rgba(251,146,60,0.4)' : 'rgba(217,119,6,0.4)'
    return t ? 'rgba(52,211,153,0.5)' : 'rgba(5,150,105,0.4)'
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  function nextMonth() {
    const next = new Date(year, month + 1, 1)
    if (next <= new Date()) setCurrentMonth(next)
    setSelectedDay(null)
  }

  const today = new Date().toLocaleDateString('en-CA')
  const canGoNext = new Date(year, month + 1, 1) <= new Date()

  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      {/* Header mes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Calendario
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>‹</button>
          <span style={{ fontSize: '13px', color: textPrimary, fontWeight: '500', textTransform: 'capitalize', minWidth: '140px', textAlign: 'center' }}>
            {monthName}
          </span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: canGoNext ? textMuted : 'transparent', cursor: canGoNext ? 'pointer' : 'default', fontSize: '16px', padding: '0 4px' }}>›</button>
        </div>
      </div>

      {/* Días semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {dias.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: textMuted, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Celdas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayData = dataMap[dateStr]
          const isToday = dateStr === today
          const isSelected = selectedDay?.date === dateStr
          const isFuture = dateStr > today

          return (
            <div
              key={day}
              onClick={() => !isFuture && dayData && setSelectedDay(isSelected ? null : dayData)}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                background: isFuture ? 'transparent' : getDayColor(dayData),
                border: `1px solid ${isSelected ? (t ? '#7c6fff' : '#6355e8') : isToday ? (t ? 'rgba(124,111,255,0.6)' : 'rgba(99,85,232,0.5)') : getDayBorder(dayData)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: isFuture ? (t ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)') : textPrimary,
                cursor: (!isFuture && dayData) ? 'pointer' : 'default',
                transition: 'all 0.15s',
                fontWeight: isToday ? '700' : '400',
              }}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
        {[
          { color: t ? 'rgba(52,211,153,0.3)' : 'rgba(5,150,105,0.25)', label: 'Todo completado' },
          { color: t ? 'rgba(251,146,60,0.35)' : 'rgba(217,119,6,0.3)', label: 'Parcial' },
          { color: t ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)', label: 'Sin completar' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
            <span style={{ fontSize: '10px', color: textMuted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Detalle día seleccionado */}
      {selectedDay && (
        <div style={{
          marginTop: '16px',
          padding: '14px 16px',
          background: t ? 'rgba(124,111,255,0.06)' : 'rgba(99,85,232,0.05)',
          border: `1px solid ${t ? 'rgba(124,111,255,0.15)' : 'rgba(99,85,232,0.15)'}`,
          borderRadius: '12px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <p style={{ fontSize: '12px', color: t ? '#7c6fff' : '#6355e8', fontWeight: '600', marginBottom: '8px' }}>
            {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' — '}
            {selectedDay.completed}/{selectedDay.total} hábitos
          </p>
          {selectedDay.notes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedDay.notes.map((n, i) => (
                <div key={i} style={{ fontSize: '12px' }}>
                  <span style={{ color: textPrimary, fontWeight: '500' }}>{n.habit}</span>
                  {n.note && <span style={{ color: textMuted }}> — {n.note}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: textMuted }}>Sin notas este día</p>
          )}
        </div>
      )}
    </div>
  )
}