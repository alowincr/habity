'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Mínimo 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f0f0fa',
    fontSize: '14px',
    outline: 'none',
  }

  if (sent) return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, #1e1040 0%, #0f0f13 60%)',
    }}>
      <div style={{
        maxWidth: '400px',
        padding: '48px 40px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📬</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f0f0fa', marginBottom: '12px' }}>
          Revisa tu correo
        </h2>
        <p style={{ fontSize: '14px', color: '#6b6b80', lineHeight: 1.6 }}>
          Enviamos un link de confirmación a <span style={{ color: '#7c6fff' }}>{email}</span>
        </p>
        <a href="/login" style={{
          display: 'inline-block',
          marginTop: '28px',
          fontSize: '13px',
          color: '#7c6fff',
          textDecoration: 'none',
        }}>
          Volver al inicio de sesión
        </a>
      </div>
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, #1e1040 0%, #0f0f13 60%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '48px 40px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.15em',
            color: '#7c6fff',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}>Habity</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f0f0fa', lineHeight: 1.2 }}>
            Crea tu cuenta
          </h1>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b6b80' }}>
            Empieza a construir mejores hábitos hoy
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b6b80', marginBottom: '6px', display: 'block' }}>Correo</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b6b80', marginBottom: '6px', display: 'block' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b6b80', marginBottom: '6px', display: 'block' }}>Confirmar contraseña</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required style={inputStyle} />
          </div>

          {error && <p style={{ fontSize: '13px', color: '#ff6b6b', textAlign: 'center' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px',
              background: 'linear-gradient(135deg, #7c6fff, #a855f7)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b6b80', marginTop: '8px' }}>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" style={{ color: '#7c6fff', textDecoration: 'none', fontWeight: '500' }}>
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </main>
  )
}