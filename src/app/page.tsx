'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const features = [
  {
    icon: '🔥',
    title: 'Rachas diarias',
    desc: 'Mantén el impulso con rachas visuales que te motivan a no romper la cadena.',
  },
  {
    icon: '📊',
    title: 'Estadísticas reales',
    desc: 'Gráficos semanales y tasas de éxito por hábito para que veas tu evolución.',
  },
  {
    icon: '🏆',
    title: 'Retos personales',
    desc: 'Lánzate desafíos de 7, 21 o 30 días y construye hábitos que duran.',
  },
  {
    icon: '📅',
    title: 'Calendario visual',
    desc: 'Un mapa mensual de tu progreso con colores que reflejan cada día.',
  },
  {
    icon: '📝',
    title: 'Notas por sesión',
    desc: 'Registra cómo te sentiste al completar cada hábito. Reflexión incluida.',
  },
  {
    icon: '🌙',
    title: 'Dark & Light mode',
    desc: 'Interfaz que se adapta a tu entorno. Tu rutina, a tu manera.',
  },
]

const habits = [
  { name: 'Leer 30 min', stat: '🔥 Racha 12 días', pct: 92, cat: 'Hobby' },
  { name: 'Ejercicio', stat: '💪 Reto 21d — 33%', pct: 75, cat: 'Salud' },
  { name: 'Tomar agua', stat: '🚀 Meta diaria', pct: 100, cat: 'Salud' },
  { name: 'Estudiar', stat: '📈 Nivel 8', pct: 60, cat: 'Estudio' },
]

export default function HomePage() {
  const [visible, setVisible] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, #1e1040 0%, #0f0f13 55%, #0a0a0f 100%)',
        color: '#f0f0fa',
        fontFamily: 'Inter, sans-serif',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.04); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .anim-0 { animation: fadeUp 0.6s ease both 0.05s; }
        .anim-1 { animation: fadeUp 0.6s ease both 0.15s; }
        .anim-2 { animation: fadeUp 0.6s ease both 0.25s; }
        .anim-3 { animation: fadeUp 0.6s ease both 0.35s; }
        .anim-4 { animation: fadeUp 0.6s ease both 0.45s; }
        .anim-5 { animation: fadeUp 0.6s ease both 0.55s; }
        .btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:active { transform: scale(0.97); }
        .btn-secondary:hover  { background: rgba(255,255,255,0.07) !important; transform: translateY(-1px); }
        .btn-secondary:active { transform: scale(0.97); }
        .btn-primary, .btn-secondary { transition: all 0.18s ease; }
        .feature-card:hover { border-color: rgba(124,111,255,0.35) !important; background: rgba(124,111,255,0.06) !important; transform: translateY(-2px); }
        .feature-card { transition: all 0.2s ease; }
        .habit-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        .mockup-card { animation: float 4s ease-in-out infinite; }
        .glow-orb { animation: pulse 5s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10,10,15,0.7)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/logo-habity.png" alt="Habity Logo" width={32} height={32} />
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              background: 'linear-gradient(135deg,#7c6fff,#a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Habity
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/login">
            <button
              className="btn-secondary"
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                color: '#c4c4d4',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Iniciar Sesión
            </button>
          </Link>
          <Link href="/register">
            <button
              className="btn-primary"
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg,#7c6fff,#a855f7)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Comenzar gratis
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          padding: '100px 32px 80px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '64px',
          alignItems: 'center',
        }}
      >
        {/* Glow de fondo */}
        <div
          className="glow-orb"
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Left */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div
            className={visible ? 'anim-0' : ''}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(124,111,255,0.12)',
              border: '1px solid rgba(124,111,255,0.25)',
              fontSize: '12px',
              color: '#a78bfa',
              fontWeight: 500,
              marginBottom: '24px',
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c6fff', display: 'inline-block' }} />
            Seguimiento de hábitos — gratis
          </div>

          <h1
            className={visible ? 'anim-1' : ''}
            style={{
              fontSize: 'clamp(40px, 6vw, 62px)',
              lineHeight: 1.08,
              fontWeight: 800,
              marginBottom: '22px',
              letterSpacing: '-0.02em',
            }}
          >
            Construye hábitos.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg,#7c6fff 30%,#e879f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mejora cada día.
            </span>
          </h1>

          <p
            className={visible ? 'anim-2' : ''}
            style={{
              fontSize: '17px',
              color: '#9ca3af',
              lineHeight: 1.75,
              maxWidth: '500px',
              marginBottom: '36px',
            }}
          >
            Organiza tus hábitos, mide tu progreso, mantén rachas y conviértete
            en una mejor versión de ti con una experiencia minimalista y poderosa.
          </p>

          {/* Social proof */}
          <div
            className={visible ? 'anim-4' : ''}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{ display: 'flex' }}>
              {['#7c6fff','#a855f7','#ec4899','#06b6d4'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: c,
                    border: '2px solid #0a0a0f',
                    marginLeft: i === 0 ? 0 : '-8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {['A','M','C','L'][i]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Únete a cientos de personas construyendo mejores hábitos
            </p>
          </div>
        </div>

        {/* Mockup */}
        <div
          className={`mockup-card ${visible ? 'anim-4' : ''}`}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Glow detrás del mockup */}
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '36px',
              background: 'radial-gradient(ellipse at center, rgba(124,111,255,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '28px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              position: 'relative',
            }}
          >
            {/* Header del mockup */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '11px', color: '#7c6fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Habity</p>
                <p style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>Buenas tardes</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: 'rgba(124,111,255,0.15)',
                    border: '1px solid rgba(124,111,255,0.2)',
                    fontSize: '11px',
                    color: '#a78bfa',
                    fontWeight: 600,
                  }}
                >
                  75% hoy
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              {[
                { v: '4', l: 'Hábitos', c: '#a78bfa' },
                { v: '3', l: 'Hoy', c: '#34d399' },
                { v: '12d', l: 'Racha', c: '#fb923c' },
              ].map(s => (
                <div
                  key={s.l}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '18px', fontWeight: 700, color: s.c }}>{s.v}</p>
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{s.l}</p>
                </div>
              ))}
            </div>

            {/* Lista hábitos con barras */}
            <div style={{ display: 'grid', gap: '10px' }}>
              {habits.map((h, i) => (
                <div
                  key={h.name}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: h.pct === 100 ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${h.pct === 100 ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      {h.pct === 100 && (
                        <span style={{ fontSize: '12px', color: '#34d399' }}>✓</span>
                      )}
                      <p style={{ fontSize: '13px', fontWeight: 500, opacity: h.pct === 100 ? 0.55 : 1, textDecoration: h.pct === 100 ? 'line-through' : 'none' }}>
                        {h.name}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: 'rgba(124,111,255,0.12)',
                        color: '#a78bfa',
                        fontWeight: 500,
                      }}
                    >
                      {h.cat}
                    </span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      className="habit-bar"
                      style={{
                        height: '100%',
                        width: `${h.pct}%`,
                        background: h.pct === 100
                          ? 'linear-gradient(90deg,#34d399,#059669)'
                          : 'linear-gradient(90deg,#7c6fff,#a855f7)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>{h.stat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          padding: '80px 32px 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Divisor */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(124,111,255,0.3), transparent)',
            marginBottom: '72px',
          }}
        />

        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p
            style={{
              fontSize: '12px',
              color: '#7c6fff',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            Todo lo que necesitas
          </p>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Diseñado para que
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg,#7c6fff,#e879f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              nunca pierdas el ritmo
            </span>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                padding: '28px',
                borderRadius: '20px',
                background: hoveredFeature === i ? 'rgba(124,111,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hoveredFeature === i ? 'rgba(124,111,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(124,111,255,0.12)',
                  border: '1px solid rgba(124,111,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '16px',
                }}
              >
                {f.icon}
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: '#f0f0fa' }}>
                {f.title}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        style={{
          padding: '0 32px 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            borderRadius: '28px',
            background: 'rgba(124,111,255,0.07)',
            border: '1px solid rgba(124,111,255,0.18)',
            padding: 'clamp(40px, 6vw, 72px) 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow central */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '400px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(124,111,255,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <p
            style={{
              fontSize: '13px',
              color: '#7c6fff',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontWeight: 600,
              position: 'relative',
            }}
          >
            Empieza hoy
          </p>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              position: 'relative',
            }}
          >
            Tu mejor versión empieza
            <br />
            con un solo hábito
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#9ca3af',
              maxWidth: '420px',
              margin: '0 auto 36px',
              lineHeight: 1.7,
              position: 'relative',
            }}
          >
            Sin excusas, sin complejidad. Crea tu primera rutina en menos de un minuto.
          </p>
          <Link href="/register" style={{ position: 'relative' }}>
            <button
              className="btn-primary"
              style={{
                padding: '16px 40px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg,#7c6fff,#a855f7)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '15px',
                letterSpacing: '0.01em',
              }}
            >
              Crear mi cuenta gratis
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/logo-habity.png" alt="Habity Logo" width={22} height={22} />
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              background: 'linear-gradient(135deg,#7c6fff,#a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Habity
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#4b5563' }}>
          © {new Date().getFullYear()} Habity. Hecho con propósito.
        </p>
      </footer>
    </main>
  )
}