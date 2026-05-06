import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useBusiness } from '../context/BusinessContext'
import { Save, Loader } from 'lucide-react'

const BLOCKS = [
  { key: 'problema',     label: 'Problema',         icon: '⚠',  color: '#e05555', desc: 'Qual dor real você resolve?',        hint: 'As 3 maiores dores do cliente.' },
  { key: 'solucao',      label: 'Solução',           icon: '💡', color: '#2e9e7a', desc: 'Como você resolve?',                hint: 'As 3 funcionalidades principais.' },
  { key: 'proposta',     label: 'Proposta de Valor', icon: '🎯', color: '#c9a84c', desc: 'Por que o cliente escolhe você?',   hint: '1 frase poderosa de diferenciação.' },
  { key: 'publico',      label: 'Público-Alvo',      icon: '👥', color: '#9b5de5', desc: 'Para quem é a solução?',            hint: 'Segmento, tamanho, localização.' },
  { key: 'concorrentes', label: 'Concorrentes',      icon: '⚔',  color: '#c0862a', desc: 'Quem mais resolve o problema?',    hint: 'Diretos e indiretos.' },
  { key: 'receita',      label: 'Fonte de Receita',  icon: '💰', color: '#2e9e7a', desc: 'Como e quanto o negócio fatura?',  hint: 'Modelo + valores estimados.' },
  { key: 'custos',       label: 'Estrutura de Custos', icon: '📊', color: '#e05555', desc: 'Quais os principais custos?',    hint: 'Fixos, variáveis, investimentos.' },
  { key: 'metricas',     label: 'Métricas-Chave',    icon: '📈', color: '#3b7dd8', desc: 'O que você monitora?',             hint: 'KPIs, metas, indicadores.' },
  { key: 'canais',       label: 'Canais',             icon: '📡', color: '#2aa8c0', desc: 'Como chega ao cliente?',           hint: 'Vendas, marketing, distribuição.' },
]

export default function CanvasPage() {
  const { activeBiz } = useBusiness()
  const [blocks,   setBlocks]   = useState({})
  const [saving,   setSaving]   = useState({})
  const [loading,  setLoading]  = useState(true)
  const timers = {}

  useEffect(() => {
    if (!activeBiz) return
    setLoading(true)
    supabase.from('canvas_blocks').select('*').eq('business_id', activeBiz.id)
      .then(({ data }) => {
        const map = {}
        data?.forEach(b => { map[b.block_key] = b.content })
        setBlocks(map)
        setLoading(false)
      })
  }, [activeBiz?.id])

  const handleChange = useCallback((key, value) => {
    setBlocks(p => ({ ...p, [key]: value }))
    setSaving(p => ({ ...p, [key]: true }))
    clearTimeout(timers[key])
    timers[key] = setTimeout(async () => {
      await supabase.from('canvas_blocks').upsert(
        { business_id: activeBiz.id, block_key: key, content: value },
        { onConflict: 'business_id,block_key' }
      )
      setSaving(p => ({ ...p, [key]: false }))
    }, 800)
  }, [activeBiz?.id])

  if (!activeBiz) return (
    <div className="flex items-center justify-center h-full text-gemba-dim text-sm font-body">
      Selecione um negócio no cabeçalho para começar.
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader className="text-gemba-gold animate-spin" size={24} />
    </div>
  )

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-gemba-gold">{activeBiz.name}</h1>
        <p className="font-body text-sm text-gemba-dim mt-1">Quadro de Negócios — edite diretamente nos campos abaixo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLOCKS.map(b => (
          <div key={b.key}
            className="bg-gemba-card border border-gemba-border rounded-2xl overflow-hidden hover:border-gemba-border-gold transition-colors"
            style={{ borderTop: `2px solid ${b.color}40` }}>
            <div className="px-4 pt-3 pb-2 border-b border-gemba-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: `${b.color}18` }}>{b.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-body font-700 uppercase tracking-wider" style={{ color: b.color }}>{b.label}</div>
                <div className="text-xs font-body text-gemba-dim mt-0.5">{b.desc}</div>
              </div>
              {saving[b.key] && <Loader size={12} className="text-gemba-gold animate-spin flex-shrink-0 mt-1" />}
              {saving[b.key] === false && <Save size={12} className="text-green-400 flex-shrink-0 mt-1" />}
            </div>
            <div className="px-4 py-2 bg-gemba-surface/50 mx-4 my-3 rounded-xl">
              <p className="text-xs font-body text-gemba-muted">ⓘ {b.hint}</p>
            </div>
            <textarea
              value={blocks[b.key] ?? ''}
              onChange={e => handleChange(b.key, e.target.value)}
              placeholder={`Preencha: ${b.label.toLowerCase()}...`}
              rows={4}
              className="w-full bg-transparent px-4 pb-4 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
