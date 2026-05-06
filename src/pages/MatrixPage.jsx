import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useBusiness } from '../context/BusinessContext'
import { Loader } from 'lucide-react'

const catInfo = (e, i) => {
  if (i >= 55 && e < 55) return { label: 'Prioridade Máxima', color: '#2e9e7a', bg: 'rgba(46,158,122,0.12)' }
  if (i >= 55 && e >= 55) return { label: 'Grandes Projetos',  color: '#c9a84c', bg: 'rgba(201,168,76,0.12)' }
  if (i < 55  && e < 55)  return { label: 'Preencha o Tempo',  color: '#7a7870', bg: 'rgba(122,120,112,0.12)' }
  return { label: 'Reavaliar', color: '#e05555', bg: 'rgba(224,85,85,0.12)' }
}

export default function MatrixPage() {
  const { activeBiz } = useBusiness()
  const [tasks,   setTasks]   = useState([])
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(true)
  const plotRef = useRef(null)

  useEffect(() => {
    if (!activeBiz) return
    setLoading(true)
    supabase.from('tasks').select('*').eq('business_id', activeBiz.id)
      .then(({ data }) => { setTasks(data || []); setLoading(false) })
  }, [activeBiz?.id])

  if (!activeBiz) return <div className="flex items-center justify-center h-full text-gemba-dim text-sm font-body">Selecione um negócio.</div>
  if (loading)    return <div className="flex items-center justify-center h-full"><Loader className="text-gemba-gold animate-spin" size={24} /></div>

  const LEGEND = [
    { label: 'Prioridade Máxima', color: '#2e9e7a', desc: 'Alto impacto + Baixo esforço' },
    { label: 'Grandes Projetos',  color: '#c9a84c', desc: 'Alto impacto + Alto esforço'  },
    { label: 'Preencha o Tempo',  color: '#7a7870', desc: 'Baixo impacto + Baixo esforço'},
    { label: 'Reavaliar',         color: '#e05555', desc: 'Baixo impacto + Alto esforço' },
  ]

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-gemba-gold">Matriz de Decisão</h1>
        <p className="font-body text-sm text-gemba-dim mt-1">
          Os pontos são plotados automaticamente com base no Impacto e Esforço de cada tarefa do Kanban · {activeBiz.name}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Plot */}
        <div ref={plotRef}
          className="relative bg-gemba-card border border-gemba-border rounded-2xl overflow-hidden flex-shrink-0"
          style={{ width: '100%', maxWidth: 520, height: 420 }}>

          {/* Quadrants */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-r border-b border-dashed border-gemba-border flex items-center justify-center">
              <span className="text-xs font-body font-700 text-gemba-muted uppercase tracking-wide text-center opacity-60">Alto Impacto<br/>Alto Esforço</span>
            </div>
            <div className="border-b border-dashed border-gemba-border flex items-center justify-center" style={{background:'rgba(46,158,122,0.04)'}}>
              <span className="text-xs font-body font-700 text-green-700 uppercase tracking-wide text-center opacity-80">🚀 Prioridade<br/>Máxima</span>
            </div>
            <div className="border-r border-dashed border-gemba-border flex items-center justify-center">
              <span className="text-xs font-body font-700 text-gemba-muted uppercase tracking-wide text-center opacity-60">Baixo Impacto<br/>Alto Esforço</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-body font-700 text-gemba-muted uppercase tracking-wide text-center opacity-60">Baixo Impacto<br/>Baixo Esforço</span>
            </div>
          </div>

          {/* Axis labels */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono text-gemba-dim pointer-events-none">
            ← Menos Esforço · Mais Esforço →
          </div>
          <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 text-xs font-mono text-gemba-dim pointer-events-none whitespace-nowrap">
            ↑ Impacto
          </div>

          {/* Task dots */}
          {tasks.map((t, i) => {
            const cat = catInfo(t.effort, t.impact)
            const x = `${t.effort}%`
            const y = `${100 - t.impact}%`
            return (
              <div key={t.id}
                className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-700 text-white cursor-pointer transition-transform hover:scale-125 z-10"
                style={{ left: x, top: y, transform: 'translate(-50%,-50%)', background: cat.color, boxShadow: `0 2px 12px ${cat.color}50` }}
                onMouseEnter={() => setHovered(t)}
                onMouseLeave={() => setHovered(null)}>
                {i + 1}
                {hovered?.id === t.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gemba-dark border border-gemba-border rounded-xl p-3 text-left whitespace-nowrap shadow-card z-20 pointer-events-none">
                    <p className="text-xs font-body font-700 text-gemba-text">{t.what}</p>
                    <p className="text-xs font-mono text-gemba-dim mt-1">E:{t.effort} · I:{t.impact}</p>
                    <p className="text-xs font-body mt-1" style={{color: cat.color}}>{cat.label}</p>
                    {t.how_much > 0 && <p className="text-xs font-mono text-gemba-gold mt-0.5">R$ {Number(t.how_much).toLocaleString('pt-BR')}</p>}
                  </div>
                )}
              </div>
            )
          })}

          {tasks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gemba-muted text-sm font-body text-center px-8">
              Adicione tarefas no Kanban com valores de Impacto e Esforço para plotar aqui.
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex-1 space-y-4">
          {/* Legend */}
          <div className="bg-gemba-card border border-gemba-border rounded-2xl p-4">
            <h3 className="text-xs font-body font-700 text-gemba-dim uppercase tracking-wider mb-3">Legenda</h3>
            <div className="space-y-2">
              {LEGEND.map(l => (
                <div key={l.label} className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: l.color }} />
                  <div>
                    <p className="text-sm font-body font-600" style={{ color: l.color }}>{l.label}</p>
                    <p className="text-xs font-body text-gemba-dim">{l.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task list ranked */}
          <div className="bg-gemba-card border border-gemba-border rounded-2xl p-4">
            <h3 className="text-xs font-body font-700 text-gemba-dim uppercase tracking-wider mb-3">Ranking por Prioridade</h3>
            <div className="space-y-2">
              {[...tasks].sort((a,b) => (b.impact - b.effort) - (a.impact - a.effort)).map((t, i) => {
                const cat = catInfo(t.effort, t.impact)
                const score = t.impact - t.effort
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gemba-border last:border-0">
                    <span className="text-xs font-mono text-gemba-dim w-5">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-600 text-gemba-text truncate">{t.what}</p>
                      <p className="text-xs font-body" style={{ color: cat.color }}>{cat.label}</p>
                    </div>
                    <span className={`text-xs font-mono font-700 ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {score > 0 ? '+' : ''}{score}
                    </span>
                  </div>
                )
              })}
              {tasks.length === 0 && <p className="text-xs font-body text-gemba-muted">Nenhuma tarefa cadastrada.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
