'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { calcularRacha } from '@/lib/utils/streaks'
import { obtenerFrase } from '@/lib/utils/quotes'
import { generarReportePDF } from '@/lib/utils/pdf'
import { estaCumplido } from '@/lib/utils/frequency'
import { getCategoryStyle } from '@/lib/utils/categoryColor'
import { getTheme, setTheme, themes } from '@/lib/utils/theme'
import StatsChart from '@/components/dashboard/StatsChart'
import HabitCalendar from '@/components/calendar/HabitCalendar'
import NoteModal from '@/components/habits/NoteModal'
import ThemeToggle from '@/components/ui/ThemeToggle'

type Habit = {
  id: string; name: string; category: string; color: string; frequency: string
}
type HabitWithStreak = Habit & {
  racha: number; completadoHoy: boolean
}
type DayData = {
  date: string; total: number; completed: number
  notes: { habit: string; note: string }[]
}
type Challenge = {
  id: string; habit_id: string; duration_days: number
  started_at: string; completed: boolean
}

const CATEGORIES = [
  { value: 'general', label: 'General' }, { value: 'salud', label: 'Salud' },
  { value: 'estudio', label: 'Estudio' }, { value: 'hobby', label: 'Hobby' },
  { value: 'trabajo', label: 'Trabajo' },
]
const FREQUENCIES = [
  { value: 'daily', label: 'Diario' }, { value: 'weekly', label: 'Semanal' },
]
type Tab = 'habitos' | 'calendario' | 'estadisticas'

export default function DashboardPage() {
  const [habits, setHabits]           = useState<HabitWithStreak[]>([])
  const [challenges, setChallenges]   = useState<Challenge[]>([])
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [chartData, setChartData]     = useState<{ dia: string; completados: number }[]>([])
  const [newHabit, setNewHabit]       = useState('')
  const [category, setCategory]       = useState('general')
  const [frequency, setFrequency]     = useState('daily')
  const [loading, setLoading]         = useState(true)
  const [frase, setFrase]             = useState({ quote: '', author: '' })
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingCat, setEditingCat]   = useState('general')
  const [editingFreq, setEditingFreq] = useState('daily')
  const [userEmail, setUserEmail]     = useState('')
  const [filtro, setFiltro]           = useState<'todos'|'pendientes'|'completados'>('todos')
  const [busqueda, setBusqueda]       = useState('')
  const [toast, setToast]             = useState<{msg:string;type:'ok'|'err'}|null>(null)
  const [tab, setTab]                 = useState<Tab>('habitos')
  const [theme, setThemeState]        = useState<'dark'|'light'>('dark')
  const [noteModal, setNoteModal]     = useState<{habitId:string;habitName:string}|null>(null)
  const [challengeModal, setChallengeModal] = useState<string|null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const t = getTheme(); setThemeState(t)
    fetchAll()
    obtenerFrase().then(setFrase)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
    })
  }, [])

  const T = themes[theme]

  function showToast(msg: string, type: 'ok'|'err' = 'ok') {
    setToast({ msg, type })
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 3000)
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next); setThemeState(next)
  }

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: habitsData }, { data: logsData }, { data: challengesData }] = await Promise.all([
      supabase.from('habits').select('*').order('created_at'),
      supabase.from('habit_logs').select('habit_id, completed_date, notes').eq('user_id', user.id),
      supabase.from('challenges').select('*').eq('user_id', user.id),
    ])

    const logsPorHabito: Record<string, { date: string; note: string }[]> = {}
    logsData?.forEach(log => {
      if (!logsPorHabito[log.habit_id]) logsPorHabito[log.habit_id] = []
      logsPorHabito[log.habit_id].push({ date: log.completed_date, note: log.notes || '' })
    })

    const habitsConRacha = (habitsData || []).map(habit => {
      const entries = logsPorHabito[habit.id] || []
      const fechas  = entries.map(e => e.date)
      return {
        ...habit,
        racha: calcularRacha(fechas),
        completadoHoy: estaCumplido(fechas, habit.frequency),
      }
    })

    setChallenges(challengesData || [])
    setHabits(habitsConRacha)
    buildChartData(habitsConRacha, logsPorHabito)
    buildCalendarData(habitsConRacha, logsPorHabito)
    setLoading(false)
  }

  function buildChartData(
    habitsData: HabitWithStreak[],
    logsPorHabito: Record<string, { date: string; note: string }[]>
  ) {
    const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(); fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toLocaleDateString('en-CA')
      let completados = 0
      for (const h of habitsData) {
        if ((logsPorHabito[h.id] || []).some(e => e.date === fechaStr)) completados++
      }
      dias.push({ dia: diasSemana[fecha.getDay()], completados })
    }
    setChartData(dias)
  }

  function buildCalendarData(
    habitsData: HabitWithStreak[],
    logsPorHabito: Record<string, { date: string; note: string }[]>
  ) {
    const dateMap: Record<string, DayData> = {}
    for (const habit of habitsData) {
      const entries = logsPorHabito[habit.id] || []
      for (const entry of entries) {
        if (!dateMap[entry.date]) {
          dateMap[entry.date] = { date: entry.date, total: habitsData.length, completed: 0, notes: [] }
        }
        dateMap[entry.date].completed++
        if (entry.note) dateMap[entry.date].notes.push({ habit: habit.name, note: entry.note })
      }
    }
    Object.values(dateMap).forEach(d => { d.total = habitsData.length })
    setCalendarData(Object.values(dateMap))
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newHabit.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('habits').insert({
      name: newHabit.trim(), user_id: user.id, category, frequency,
    })
    if (error) { showToast('Error al crear', 'err'); return }
    showToast('Hábito creado')
    setNewHabit(''); setCategory('general'); setFrequency('daily')
    fetchAll()
  }

  async function deleteHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
    await supabase.from('habits').delete().eq('id', id)
    showToast('Eliminado')
  }

  function requestMarkDone(habitId: string, habitName: string) {
    setNoteModal({ habitId, habitName })
  }

  async function confirmMarkDone(note: string) {
    if (!noteModal) return
    const { habitId } = noteModal
    setNoteModal(null)

    const hoy = new Date().toLocaleDateString('en-CA') // devuelve YYYY-MM-DD en hora local
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, completadoHoy: true, racha: h.racha + 1 } : h
    ))
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('habit_logs').upsert({
      habit_id: habitId, user_id: user.id, completed_date: hoy, notes: note || null,
    })
    if (error) {
      showToast('Error al registrar', 'err')
      setHabits(prev => prev.map(h =>
        h.id === habitId ? { ...h, completadoHoy: false, racha: Math.max(0, h.racha - 1) } : h
      ))
    } else {
      showToast(note ? '¡Completado con nota!' : '¡Completado!')
      fetchAll()
    }
  }

  async function unmarkDone(habitId: string) {
    const hoy = new Date().toLocaleDateString('en-CA') // ← esto estaba con toISOString()
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, completadoHoy: false, racha: Math.max(0, h.racha - 1) } : h
    ))
    await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('completed_date', hoy)
    showToast('Desmarcado')
    fetchAll()
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) return
    await supabase.from('habits').update({
      name: editingName.trim(), category: editingCat, frequency: editingFreq,
    }).eq('id', id)
    showToast('Actualizado')
    setEditingId(null)
    fetchAll()
  }

  async function startChallenge(habitId: string, days: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const existing = challenges.find(c => c.habit_id === habitId && !c.completed)
    if (existing) { showToast('Ya tienes un reto activo', 'err'); return }
    await supabase.from('challenges').insert({
      user_id: user.id, habit_id: habitId, duration_days: days,
      started_at: new Date().toLocaleDateString('en-CA'),
    })
    showToast(`¡Reto de ${days} días iniciado!`)
    setChallengeModal(null)
    fetchAll()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const habitsFiltrados = habits
    .filter(h => filtro === 'todos' ? true : filtro === 'pendientes' ? !h.completadoHoy : h.completadoHoy)
    .filter(h => h.name.toLowerCase().includes(busqueda.toLowerCase()))

  const completadosHoy = habits.filter(h => h.completadoHoy).length
  const rachaMax       = habits.length > 0 ? Math.max(...habits.map(h => h.racha)) : 0
  const porcentajeHoy  = habits.length > 0 ? Math.round((completadosHoy / habits.length) * 100) : 0

  const selectStyle: React.CSSProperties = {
    padding: '10px 36px 10px 14px', borderRadius: '10px',
    background: T.inputBg, border: `1px solid ${T.border}`,
    color: T.text, fontSize: '13px', outline: 'none',
    appearance: 'none', cursor: 'pointer',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: '10px', border: '1px solid',
    borderColor: active ? T.accentBorder : 'transparent',
    background: active ? T.accentBg : 'transparent',
    color: active ? T.accent : T.textFaint,
    fontSize: '13px', cursor: 'pointer', fontWeight: active ? '600' : '400',
    transition: 'all 0.15s',
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: `2px solid ${T.accentBg}`, borderTop: `2px solid ${T.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: T.textMuted, fontSize: '13px' }}>Cargando...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: T.bg, padding: '32px 16px 80px', transition: 'background 0.3s' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        input::placeholder, textarea::placeholder { color: ${T.textFaint}; }
        input:focus, textarea:focus { border-color: ${T.accentBorder} !important; }
        button:active { transform: scale(0.97); }
        option { background: ${theme === 'dark' ? '#1a1a2e' : '#fff'}; color: ${T.text}; }
      `}</style>

      {/* Note Modal */}
      {noteModal && (
        <NoteModal
          habitName={noteModal.habitName}
          theme={theme}
          onConfirm={confirmMarkDone}
          onCancel={() => { setNoteModal(null) }}
        />
      )}

      {/* Challenge Modal */}
      {challengeModal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', backdropFilter:'blur(4px)' }}>
          <div style={{ width:'100%', maxWidth:'360px', background: theme === 'dark' ? '#1a1a2e' : '#fff', border:`1px solid ${T.border}`, borderRadius:'20px', padding:'28px', animation:'slideUp 0.2s ease' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'600', color:T.text, marginBottom:'8px' }}>Iniciar reto</h3>
            <p style={{ fontSize:'13px', color:T.textMuted, marginBottom:'20px' }}>
              {habits.find(h => h.id === challengeModal)?.name}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[7, 21, 30, 66].map(days => (
                <button key={days} onClick={() => startChallenge(challengeModal, days)}
                  style={{ padding:'12px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:'12px', color:T.accent, fontSize:'14px', fontWeight:'500', cursor:'pointer' }}>
                  {days} días — {days === 7 ? 'Una semana' : days === 21 ? 'Formación de hábito' : days === 30 ? 'Un mes' : 'Automatización'}
                </button>
              ))}
              <button onClick={() => setChallengeModal(null)}
                style={{ padding:'12px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:'12px', color:T.textMuted, fontSize:'14px', cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', padding:'10px 20px', background: toast.type==='ok' ? T.greenBg : 'rgba(255,107,107,0.15)', border:`1px solid ${toast.type==='ok' ? 'rgba(52,211,153,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius:'12px', color: toast.type==='ok' ? T.green : T.red, fontSize:'13px', fontWeight:'500', zIndex:100, animation:'slideIn 0.2s ease', whiteSpace:'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:'640px', margin:'0 auto', animation:'fadeIn 0.3s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <div style={{ fontSize:'11px', color:T.accent, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'6px' }}>Habity</div>
            <h1 style={{ fontSize:'24px', fontWeight:'700', color:T.text, lineHeight:1.2 }}>Buenos días</h1>
            {userEmail && <p style={{ fontSize:'12px', color:T.textFaint, marginTop:'3px' }}>{userEmail}</p>}
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button onClick={() => router.push('/profile')} style={{ width:'34px', height:'34px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'9px', color:T.textMuted, cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>👤</button>
            <button onClick={() => generarReportePDF(habits, completadosHoy)} style={{ padding:'8px 14px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:'9px', color:T.accent, fontSize:'12px', cursor:'pointer', fontWeight:'500' }}>PDF</button>
            <button onClick={handleLogout} style={{ padding:'8px 14px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'9px', color:T.textFaint, fontSize:'12px', cursor:'pointer' }}>Salir</button>
          </div>
        </div>

        {/* Frase */}
        {frase.quote && (
          <div style={{ padding:'16px 20px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:'14px', marginBottom:'20px' }}>
            <p style={{ fontSize:'13px', color:T.accent, fontStyle:'italic', lineHeight:1.6 }}>"{frase.quote}"</p>
            <p style={{ fontSize:'11px', color:T.textFaint, marginTop:'6px' }}>— {frase.author}</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          {[
            { label:'Total',  value:habits.length,   color:T.accent },
            { label:'Hoy',    value:completadosHoy,  color:T.green  },
            { label:'Racha',  value:`${rachaMax}d`,  color:T.orange },
            { label:'Avance', value:`${porcentajeHoy}%`, color:T.blue  },
          ].map(stat => (
            <div key={stat.label} style={{ padding:'16px 12px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'14px', textAlign:'center' }}>
              <p style={{ fontSize:'22px', fontWeight:'700', color:stat.color }}>{stat.value}</p>
              <p style={{ fontSize:'10px', color:T.textFaint, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progreso */}
        {habits.length > 0 && (
          <div style={{ marginBottom:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontSize:'11px', color:T.textFaint }}>Progreso de hoy</span>
              <span style={{ fontSize:'11px', color:T.accent }}>{completadosHoy}/{habits.length}</span>
            </div>
            <div style={{ height:'4px', background:T.border, borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${porcentajeHoy}%`, background:T.gradient, borderRadius:'2px', transition:'width 0.5s ease' }} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
          {(['habitos','calendario','estadisticas'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
              {t === 'habitos' ? '✅ Hábitos' : t === 'calendario' ? '📅 Calendario' : '📊 Estadísticas'}
            </button>
          ))}
        </div>

        {/* TAB: HÁBITOS */}
        {tab === 'habitos' && (
          <>
            {/* Gráfica */}
            <StatsChart data={chartData} theme={theme} />

            {/* Agregar */}
            <div style={{ padding:'20px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', marginBottom:'20px' }}>
              <p style={{ fontSize:'11px', color:T.textFaint, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Nuevo hábito</p>
              <form onSubmit={addHabit} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <input type="text" placeholder="Ej: Leer 30 minutos..." value={newHabit} onChange={e => setNewHabit(e.target.value)}
                  style={{ width:'100%', padding:'12px 16px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'10px', color:T.text, fontSize:'14px', outline:'none' }} />
                <div style={{ display:'flex', gap:'10px' }}>
                  <div style={{ position:'relative', flex:1 }}>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <span style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.textFaint, fontSize:'10px' }}>▼</span>
                  </div>
                  <div style={{ position:'relative', flex:1 }}>
                    <select value={frequency} onChange={e => setFrequency(e.target.value)} style={selectStyle}>
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <span style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.textFaint, fontSize:'10px' }}>▼</span>
                  </div>
                  <button type="submit" style={{ padding:'10px 20px', background:T.gradient, border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' }}>
                    + Agregar
                  </button>
                </div>
              </form>
            </div>

            {/* Filtros */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
              <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                style={{ flex:1, minWidth:'120px', padding:'8px 14px', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:'10px', color:T.text, fontSize:'13px', outline:'none' }} />
              {(['todos','pendientes','completados'] as const).map(f => (
                <button key={f} onClick={() => setFiltro(f)} style={{ padding:'8px 14px', borderRadius:'10px', border:'1px solid', borderColor: filtro===f ? T.accentBorder : T.border, background: filtro===f ? T.accentBg : 'transparent', color: filtro===f ? T.accent : T.textFaint, fontSize:'12px', cursor:'pointer', fontWeight: filtro===f ? '600' : '400', textTransform:'capitalize', transition:'all 0.15s' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Lista */}
            {habitsFiltrados.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 0' }}>
                <p style={{ color:T.textFaint, fontSize:'14px' }}>{busqueda ? 'Sin resultados' : 'Sin hábitos aquí'}</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {habitsFiltrados.map(habit => {
                  const catStyle  = getCategoryStyle(habit.category, theme)
                  const challenge = challenges.find(c => c.habit_id === habit.id && !c.completed)
                  const isEditing = editingId === habit.id

                  let challengeProgress = 0
                  let challengeDaysLeft = 0
                  if (challenge) {
                    const start = new Date(challenge.started_at)
                    const today = new Date()
                    const elapsed = Math.floor((today.getTime() - start.getTime()) / 86400000)
                    challengeProgress = Math.min(100, Math.round((elapsed / challenge.duration_days) * 100))
                    challengeDaysLeft = Math.max(0, challenge.duration_days - elapsed)
                  }

                  return (
                    <div key={habit.id} style={{ padding:'16px 18px', background: habit.completadoHoy ? T.greenBg : T.bgCard, border:`1px solid ${habit.completadoHoy ? 'rgba(52,211,153,0.15)' : T.border}`, borderRadius:'14px', transition:'border-color 0.2s' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          {isEditing ? (
                            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                              <input value={editingName} onChange={e => setEditingName(e.target.value)} autoFocus
                                style={{ width:'100%', padding:'8px 12px', background:T.inputBg, border:`1px solid ${T.accentBorder}`, borderRadius:'8px', color:T.text, fontSize:'14px', outline:'none' }} />
                              <div style={{ display:'flex', gap:'8px' }}>
                                <div style={{ position:'relative', flex:1 }}>
                                  <select value={editingCat} onChange={e => setEditingCat(e.target.value)} style={{ ...selectStyle, width:'100%', fontSize:'12px', padding:'7px 28px 7px 10px' }}>
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                  </select>
                                  <span style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.textFaint, fontSize:'9px' }}>▼</span>
                                </div>
                                <div style={{ position:'relative', flex:1 }}>
                                  <select value={editingFreq} onChange={e => setEditingFreq(e.target.value)} style={{ ...selectStyle, width:'100%', fontSize:'12px', padding:'7px 28px 7px 10px' }}>
                                    {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                  </select>
                                  <span style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.textFaint, fontSize:'9px' }}>▼</span>
                                </div>
                              </div>
                              <div style={{ display:'flex', gap:'8px' }}>
                                <button onClick={() => saveEdit(habit.id)} style={{ flex:1, padding:'8px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:'8px', color:T.accent, fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>Guardar</button>
                                <button onClick={() => setEditingId(null)} style={{ flex:1, padding:'8px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:'8px', color:T.textFaint, fontSize:'13px', cursor:'pointer' }}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                                <p style={{ fontSize:'14px', fontWeight:'500', color:T.text, textDecoration: habit.completadoHoy ? 'line-through' : 'none', opacity: habit.completadoHoy ? 0.6 : 1 }}>
                                  {habit.name}
                                </p>
                                {habit.racha >= 2 && (
                                  <span style={{ fontSize:'10px', background:'rgba(251,146,60,0.12)', color:T.orange, padding:'2px 8px', borderRadius:'20px', fontWeight:'600' }}>
                                    {habit.racha}d 🔥
                                  </span>
                                )}
                                {challenge && (
                                  <span style={{ fontSize:'10px', background:T.accentBg, color:T.accent, padding:'2px 8px', borderRadius:'20px', fontWeight:'600' }}>
                                    🏆 {challengeDaysLeft}d
                                  </span>
                                )}
                              </div>
                              <div style={{ display:'flex', gap:'6px', marginTop:'5px', alignItems:'center', flexWrap:'wrap' }}>
                                <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'999px', background:catStyle.bg, color:catStyle.text, fontWeight:'500' }}>{catStyle.label}</span>
                                <span style={{ fontSize:'10px', color:T.textFaint }}>{habit.frequency === 'daily' ? 'Diario' : 'Semanal'}</span>
                                {habit.completadoHoy && <span style={{ fontSize:'10px', color:T.green }}>✓ completado</span>}
                              </div>

                              {/* Barra reto */}
                              {challenge && (
                                <div style={{ marginTop:'8px' }}>
                                  <div style={{ height:'3px', background:T.border, borderRadius:'2px', overflow:'hidden' }}>
                                    <div style={{ height:'100%', width:`${challengeProgress}%`, background:T.gradient, borderRadius:'2px', transition:'width 0.5s' }} />
                                  </div>
                                  <p style={{ fontSize:'10px', color:T.textFaint, marginTop:'3px' }}>
                                    Reto {challenge.duration_days}d — {challengeProgress}% · {challengeDaysLeft} días restantes
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {!isEditing && (
                          <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                            {habit.completadoHoy ? (
                              <button onClick={() => unmarkDone(habit.id)} title="Desmarcar"
                                style={{ width:'34px', height:'34px', background:T.greenBg, border:`1px solid rgba(52,211,153,0.2)`, borderRadius:'9px', color:T.green, fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>↩</button>
                            ) : (
                              <button onClick={() => requestMarkDone(habit.id, habit.name)} title="Completar"
                                style={{ width:'34px', height:'34px', background:T.greenBg, border:`1px solid rgba(52,211,153,0.15)`, borderRadius:'9px', color:T.green, fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✓</button>
                            )}
                            {!challenge && (
                              <button onClick={() => setChallengeModal(habit.id)} title="Iniciar reto"
                                style={{ width:'34px', height:'34px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:'9px', color:T.accent, fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>🏆</button>
                            )}
                            <button onClick={() => { setEditingId(habit.id); setEditingName(habit.name); setEditingCat(habit.category); setEditingFreq(habit.frequency) }} title="Editar"
                              style={{ width:'34px', height:'34px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:'9px', color:T.accent, fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
                            <button onClick={() => deleteHabit(habit.id)} title="Eliminar"
                              style={{ width:'34px', height:'34px', background:'rgba(255,107,107,0.06)', border:'1px solid rgba(255,107,107,0.12)', borderRadius:'9px', color:T.red, fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* TAB: CALENDARIO */}
        {tab === 'calendario' && (
          <HabitCalendar data={calendarData} theme={theme} />
        )}

        {/* TAB: ESTADÍSTICAS */}
        {tab === 'estadisticas' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <StatsChart data={chartData} theme={theme} mode="line" title="Tendencia — últimos 7 días" />

            <div style={{ padding:'20px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px' }}>
              <p style={{ fontSize:'11px', color:T.textFaint, marginBottom:'16px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Tasa de éxito por hábito
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {habits.map(habit => {
                  const catStyle = getCategoryStyle(habit.category, theme)
                  const pct = habits.length > 0
                    ? Math.round((calendarData.filter(d => d.notes.some(n => n.habit === habit.name)).length / Math.max(1, calendarData.length)) * 100)
                    : 0
                  return (
                    <div key={habit.id}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ fontSize:'12px', color:T.text, fontWeight:'500' }}>{habit.name}</span>
                          <span style={{ fontSize:'10px', padding:'1px 7px', borderRadius:'20px', background:catStyle.bg, color:catStyle.text }}>{catStyle.label}</span>
                        </div>
                        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                          <span style={{ fontSize:'11px', color:T.textFaint }}>Racha: {habit.racha}d 🔥</span>
                          <span style={{ fontSize:'12px', color:T.accent, fontWeight:'600' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height:'4px', background:T.border, borderRadius:'2px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:T.gradient, borderRadius:'2px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div style={{ padding:'20px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', textAlign:'center' }}>
                <p style={{ fontSize:'28px', fontWeight:'700', color:T.accent }}>{rachaMax}d</p>
                <p style={{ fontSize:'11px', color:T.textFaint, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Racha activa máx.</p>
              </div>
              <div style={{ padding:'20px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', textAlign:'center' }}>
                <p style={{ fontSize:'28px', fontWeight:'700', color:T.green }}>{calendarData.length}</p>
                <p style={{ fontSize:'11px', color:T.textFaint, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Días activos</p>
              </div>
              <div style={{ padding:'20px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', textAlign:'center' }}>
                <p style={{ fontSize:'28px', fontWeight:'700', color:T.orange }}>{challenges.length}</p>
                <p style={{ fontSize:'11px', color:T.textFaint, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Retos iniciados</p>
              </div>
              <div style={{ padding:'20px', background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'16px', textAlign:'center' }}>
                <p style={{ fontSize:'28px', fontWeight:'700', color:T.blue }}>{porcentajeHoy}%</p>
                <p style={{ fontSize:'11px', color:T.textFaint, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Avance hoy</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}