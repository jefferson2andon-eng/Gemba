import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBusiness } from '../context/BusinessContext'
import { Loader, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const statusBadge = (status) => {
  const map = {
    ativo:     { label: 'Ativo',     color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle  },
    pausado:   { label: 'Pausado',   color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock        },
    encerrado: { label: 'Encerrado', color: 'text-red-400',    bg: 'bg-red-400/10',    icon: AlertTriangle},
  }
  return map[status] || map.ativo
}

const healthScore = (canvas, tasks) => {
  const canvasScore  = Object.values(canvas).filter(v => v && v.trim().length > 10).length
  const tasksDone    = tasks.filter(t => t.status === 'done').length
  const totalTasks   = tasks.length
  const completion   = totalTasks > 0 ? (tasksDone / totalTasks) * 100 : 0
  const score        = Math.round((canvasScore / 9) * 50 + (completion / 100) * 50)
  if (score >= 70) return { score, label: 'Saudável',   color: 'text-green-400',  bg: 'bg-green-400/10',  bar: '#2e9e7a' }
  if (score >= 40) return { score, label: 'Atenção',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', bar: '#c9a84c' }
  return               { score, label: 'Crítico',    color: 'text-red-400',    bg: 'bg-red-400/10',    bar: '#e05555' }
}

export default function ComparativePage() {
  const { businesses } = useBusiness()
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      const rows = await Promise.all(businesses.map(async (biz) => {
        const [{ data: canvas }, { data: tasks }] = await Promise.all([
          supabase.from('canvas_blocks').select('*').eq('business_id', biz.id),
          supabase.from('tasks').select('*').eq('business_id', biz.id),
        ])
        const canvasMap = {}
        canvas?.forEach(b => { canvasMap[b.block_key] = b.content })
        return { biz, canvas: canvasMap, tasks: tasks || [] }
      }))
      setData(rows)
      setLoading(false)
    }
    if (businesses.length) loadAll()
    else setLoading(false)
  }, [businesses])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader className="text-gemba-gold animate-spin" size={24} /></div>

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-gemba-gold">Análise Comparativa</h1>
        <p className="font-body text-sm text-gemba-dim mt-1">Visão global de todos os negócios do portfólio</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total de Negócios', value: businesses.length, icon: TrendingUp, color: 'text-gemba-gold' },
          { label: 'Ativos', value: businesses.filter(b=>b.status==='ativo').length, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Pausados', value: businesses.filter(b=>b.status==='pausado').length, icon: Clock, color: 'text-yellow-400' },
          { label: 'Total de Tarefas', value: data.reduce((s,r) => s + r.tasks.length, 0), icon: AlertTriangle, color: 'text-gemba-dim' },
        ].map(c => (
          <div key={c.label} className="bg-gemba-card border border-gemba-border rounded-2xl p-4">
            <div className={`text-2xl font-display font-700 ${c.color}`}>{c.value}</div>
            <div className="text-xs font-body text-gemba-dim mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gemba-card border border-gemba-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gemba-border">
                {['Negócio', 'Status', 'Saúde do Canvas', 'Tarefas', 'Custo Acumulado', 'Score'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-body font-700 text-gemba-dim uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(({ biz, canvas, tasks }) => {
                const health   = healthScore(canvas, tasks)
                const st       = statusBadge(biz.status)
                const StatusIc = st.icon
                const totalCost = tasks.reduce((s, t) => s + Number(t.how_much || 0), 0)
                const done = tasks.filter(t => t.status === 'done').length

                return (
                  <tr key={biz.id} className="border-b border-gemba-border last:border-0 hover:bg-gemba-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: biz.color }} />
                        <span className="text-sm font-body font-600 text-gemba-text">{biz.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-body font-600 px-2.5 py-1 rounded-full ${st.color} ${st.bg}`}>
                        <StatusIc size={11} />{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gemba-surface rounded-full overflow-hidden max-w-[80px]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(Object.values(canvas).filter(v=>v&&v.trim().length>10).length/9)*100}%`, background: health.bar }} />
                        </div>
                        <span className={`text-xs font-mono ${health.color}`}>
                          {Object.values(canvas).filter(v=>v&&v.trim().length>10).length}/9
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-body text-gemba-text">
                        <span className="text-green-400 font-600">{done}</span>
                        <span className="text-gemba-dim">/{tasks.length} concluídas</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gemba-gold">
                        {totalCost > 0 ? `R$ ${totalCost.toLocaleString('pt-BR')}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-mono font-700 px-2.5 py-1 rounded-full ${health.color} ${health.bg}`}>
                        {health.score}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gemba-dim text-sm font-body">Nenhum negócio cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
