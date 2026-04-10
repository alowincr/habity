'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'

type Props = {
  data: { dia: string; completados: number }[]
  theme: 'dark' | 'light'
  mode?: 'bar' | 'line'
  title?: string
}

export default function StatsChart({ data, theme, mode = 'bar', title }: Props) {
  const t = theme === 'dark'
  const gridColor     = t ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const tickColor     = t ? '#6b6b80' : '#9090a0'
  const tooltipBg     = t ? '#1a1a2e' : '#ffffff'
  const tooltipBorder = t ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const tooltipText   = t ? '#f0f0fa' : '#1a1a2e'

  return (
    <div style={{
      background: t ? 'rgba(255,255,255,0.03)' : '#ffffff',
      border: `1px solid ${t ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <p style={{ fontSize: '11px', color: tickColor, marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {title ?? 'Cumplimiento — últimos 7 días'}
      </p>
      <ResponsiveContainer width="100%" height={160}>
        {mode === 'line' ? (
          <LineChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', color: tooltipText, fontSize: '12px' }}
              cursor={{ stroke: 'rgba(124,111,255,0.2)' }}
            />
            <Line type="monotone" dataKey="completados" stroke="#7c6fff" strokeWidth={2} dot={{ fill: '#7c6fff', r: 3 }} name="Completados" />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c6fff" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', color: tooltipText, fontSize: '12px' }}
              cursor={{ fill: 'rgba(124,111,255,0.08)' }}
            />
            <Bar dataKey="completados" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Completados" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}