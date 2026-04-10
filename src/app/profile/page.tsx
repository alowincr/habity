'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getTheme, themes } from '@/lib/utils/theme'
import { calcularRachaMaxHistorica } from '@/lib/utils/streaks'

export default function ProfilePage() {
  const [name, setName]         = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')
  const [stats, setStats]       = useState({ totalDias: 0, rachaMaxHistorica: 0, habitoTop: '', totalHabitos: 0 })
  const [userId, setUserId]     = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [theme] = useState<'dark'|'light'>(getTheme)
  const fileRef = useRef<HTMLInputElement>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const router = useRouter()
  const supabase = createClient()
  const T = themes[theme]

  useEffect(() => { loadProfile() }, [])

  function showToast(msg: string) {
    setToast(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(''), 3000)
  }

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)
    setUserEmail(user.email ?? '')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile) { setName(profile.name ?? ''); setAvatarUrl(profile.avatar_url ?? '') }

    const { data: habitsData } = await supabase.from('habits').select('id, name').eq('user_id', user.id)
    const { data: logsData }   = await supabase.from('habit_logs').select('habit_id, completed_date').eq('user_id', user.id)

    if (!habitsData || !logsData) return

    const fechasUnicas = [...new Set(logsData.map(l => l.completed_date))]

    const logsPorHabito: Record<string, string[]> = {}
    logsData.forEach(l => {
      if (!logsPorHabito[l.habit_id]) logsPorHabito[l.habit_id] = []
      logsPorHabito[l.habit_id].push(l.completed_date)
    })

    const todasFechas = logsData.map(l => l.completed_date)
    const rachaMaxHistorica = calcularRachaMaxHistorica([...new Set(todasFechas)])

    let habitoTop = ''
    let maxLogs = 0
    for (const habit of habitsData) {
      const count = (logsPorHabito[habit.id] || []).length
      if (count > maxLogs) { maxLogs = count; habitoTop = habit.name }
    }

    setStats({
      totalDias: fechasUnicas.length,
      rachaMaxHistorica,
      habitoTop,
      totalHabitos: habitsData.length,
    })
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { showToast('Error al subir imagen'); setUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setUploading(false)
    showToast('Avatar actualizado')
  }

  async function saveProfile() {
    if (!userId) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: userId, name: name.trim(), avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    setSaving(false)
    showToast('Perfil guardado')
  }

  const initials = name ? name.slice(0, 2).toUpperCase() : userEmail.slice(0, 2).toUpperCase()

  return (
    <main style={{ minHeight:'100vh', background:T.bg, padding:'32px 16px 80px' }}>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} } @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} } input::placeholder{color:${T.textFaint};}`}</style>

      {toast && (
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', padding:'10px 20px', background:T.greenBg, border:`1px solid rgba(52,211,153,0.3)`, borderRadius:'12px', color:T.green, fontSize:'13px', fontWeight:'500', zIndex:100, animation:'slideIn 0.2s ease', whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth:'480px', margin:'0 auto', animation:'fadeIn 0.3s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'32px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ width:'36px', height:'36px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'10px', color:T.textMuted, cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            ‹
          </button>
          <div>
            <div style={{ fontSize:'11px', color:T.accent, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'2px' }}>Habity</div>
            <h1 style={{ fontSize:'22px', fontWeight:'700', color:T.text }}>Mi perfil</h1>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'32px' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width:'100px', height:'100px', borderRadius:'50%', background: avatarUrl ? 'transparent' : T.accentBg, border:`2px solid ${T.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', position:'relative' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : (
              <span style={{ fontSize:'28px', fontWeight:'700', color:T.accent }}>{initials}</span>
            )}
            {uploading && (
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:'20px', height:'20px', border:`2px solid rgba(255,255,255,0.2)`, borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              </div>
            )}
          </div>
          <p style={{ fontSize:'12px', color:T.textFaint, marginTop:'8px' }}>Toca para cambiar el avatar</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:'none' }} />
        </div>

        {/* Formulario */}
        <div style={{ padding:'24px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', marginBottom:'20px' }}>
          <p style={{ fontSize:'11px', color:T.textFaint, marginBottom:'14px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Información</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div>
              <label style={{ fontSize:'12px', color:T.textMuted, marginBottom:'6px', display:'block' }}>Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
                style={{ width:'100%', padding:'12px 16px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'10px', color:T.text, fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:'12px', color:T.textMuted, marginBottom:'6px', display:'block' }}>Correo</label>
              <input type="text" value={userEmail} disabled
                style={{ width:'100%', padding:'12px 16px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'10px', color:T.textFaint, fontSize:'14px', outline:'none' }} />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving}
            style={{ marginTop:'16px', width:'100%', padding:'12px', background:T.gradient, border:'none', borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </div>

        {/* Stats de logros */}
        <div style={{ padding:'24px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', marginBottom:'20px' }}>
          <p style={{ fontSize:'11px', color:T.textFaint, marginBottom:'16px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Logros</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { label:'Total hábitos',     value:stats.totalHabitos,        color:T.accent },
              { label:'Días activos',      value:stats.totalDias,           color:T.green  },
              { label:'Racha histórica',   value:`${stats.rachaMaxHistorica}d`, color:T.orange },
              { label:'Hábito top',        value:stats.habitoTop || '—',    color:T.blue, small:true },
            ].map(s => (
              <div key={s.label} style={{ padding:'16px', background:T.bg, border:`1px solid ${T.border}`, borderRadius:'12px', textAlign:'center' }}>
                <p style={{ fontSize: s.small ? '13px' : '24px', fontWeight:'700', color:s.color, lineHeight:1.2, wordBreak:'break-word' }}>{s.value}</p>
                <p style={{ fontSize:'10px', color:T.textFaint, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          style={{ width:'100%', padding:'12px', background:'rgba(255,107,107,0.06)', border:'1px solid rgba(255,107,107,0.12)', borderRadius:'12px', color:T.red, fontSize:'14px', cursor:'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}