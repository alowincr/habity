'use client'

import { useState } from 'react'

type Props = {
  habitName: string
  theme: 'dark' | 'light'
  onConfirm: (note: string) => void
  onCancel: () => void
}

export default function NoteModal({ habitName, theme, onConfirm, onCancel }: Props) {
  const [note, setNote] = useState('')
  const t = theme === 'dark'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: t ? '#1a1a2e' : '#ffffff',
        border: `1px solid ${t ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '20px',
        padding: '28px',
        animation: 'slideUp 0.2s ease',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: t ? '#f0f0fa' : '#1a1a2e', marginBottom: '4px' }}>
          ¡Hábito completado!
        </h3>
        <p style={{ fontSize: '13px', color: t ? '#6b6b80' : '#9090a0', marginBottom: '20px' }}>
          {habitName}
        </p>

        <label style={{ fontSize: '12px', color: t ? '#6b6b80' : '#9090a0', marginBottom: '8px', display: 'block' }}>
          Agrega una nota del día (opcional)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder='Ej: "Corrí 5km, me sentí muy bien"'
          rows={3}
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
            background: t ? 'rgba(255,255,255,0.05)' : '#f4f4f8',
            border: `1px solid ${t ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px',
            color: t ? '#f0f0fa' : '#1a1a2e',
            fontSize: '14px',
            outline: 'none',
            resize: 'none',
            marginBottom: '16px',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onConfirm(note.trim())}
            style={{
              flex: 1, padding: '12px',
              background: 'linear-gradient(135deg, #7c6fff, #a855f7)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Guardar
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px',
              background: 'transparent',
              border: `1px solid ${t ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '12px',
              color: t ? '#6b6b80' : '#9090a0',
              fontSize: '14px', cursor: 'pointer',
            }}
          >
            Sin nota
          </button>
        </div>
      </div>
    </div>
  )
}