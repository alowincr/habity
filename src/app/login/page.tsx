'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

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
        backdropFilter: 'blur(20px)',
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
            Bienvenido<br />de vuelta
          </h1>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b6b80' }}>
            Continúa construyendo tus hábitos
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b6b80', marginBottom: '6px', display: 'block' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: '#f0f0fa',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#6b6b80', marginBottom: '6px', display: 'block' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: '#f0f0fa',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ff6b6b', textAlign: 'center' }}>{error}</p>
          )}

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
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b6b80', marginTop: '8px' }}>
            ¿No tienes cuenta?{' '}
            <a href="/register" style={{ color: '#7c6fff', textDecoration: 'none', fontWeight: '500' }}>
              Regístrate
            </a>
          </p>
        </form>
      </div>
    </main>
  )
}