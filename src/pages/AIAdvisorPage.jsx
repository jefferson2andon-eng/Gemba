import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBusiness } from '../context/BusinessContext'
import { BrainCircuit, Loader, Sparkles, AlertCircle } from 'lucide-react'

export default function AIAdvisorPage() {
  const { activeBiz } = useBusiness()
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [history,  setHistory]  = useState([])
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!activeBiz) return
    supabase
      .from('ai_analyses')
      .select('*')
      .eq('business_id', activeBiz.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error: err }) => {
        if (err) { console.error('Erro ao carregar histórico:', err.message); return }
        if (data?.length) { setResult(data[0].content); setHistory(data) }
        else { setResult(null); setHistory([]) }
      })
  }, [activeBiz?.id])

  const handleAnalyze = async () => {
    if (!activeBiz) return
    setLoading(true)
    setError('')

    const [{ data: canvas, error: canvasErr }, { data: tasks, error: tasksErr }] = await Promise.all([
      supabase.from('canvas_blocks').select('*').eq('business_id', activeBiz.id),
      supabase.from('tasks').select('*').eq('business_id', activeBiz.id),
    ])

    if (canvasErr || tasksErr) {
      setError('Erro ao buscar dados do negócio. Verifique a conexão.')
      setLoading(false)
      return
    }

    const canvasMap = {}
    canvas?.forEach(b => { canvasMap[b.block_key] = b.content })

    const prompt = `Você é um consultor estratégico sênior da Gemba. Analise os dados abaixo e retorne um diagnóstico executivo COMPLETO em HTML formatado profissionalmente.

O HTML deve incluir:
1. Parágrafo de resumo executivo
2. Matriz SWOT completa em cards (verde=forças, vermelho=fraquezas, azul=oportunidades, amarelo=ameaças)
3. Análise financeira baseada nos custos do 5W2H
4. Recomendação estratégica: PROSSEGUIR, PIVOTAR ou ABANDONAR (com justificativa)
5. Top 3 próximas ações prioritárias

Use estilos inline compatíveis com fundo escuro (#111114). Fonte 'DM Sans' 14px. Tudo em Português do Brasil. Retorne APENAS o HTML, sem markdown, sem backticks.

NEGÓCIO: ${activeBiz.name} | STATUS: ${activeBiz.status}

CANVAS:
Problema: ${canvasMap.problema || 'Não preenchido'}
Solução: ${canvasMap.solucao || 'Não preenchido'}
Proposta de Valor: ${canvasMap.proposta || 'Não preenchido'}
Público-Alvo: ${canvasMap.publico || 'Não preenchido'}
Concorrentes: ${canvasMap.concorrentes || 'Não preenchido'}
Receita: ${canvasMap.receita || 'Não preenchido'}
Custos: ${canvasMap.custos || 'Não preenchido'}
Métricas: ${canvasMap.metricas || 'Não preenchido'}
Canais: ${canvasMap.canais || 'Não preenchido'}

TAREFAS 5W2H:
${tasks?.map(t => `- ${t.what} | Quem: ${t.who||'N/A'} | Quando: ${t.when_date||'N/A'} | Custo: R$${t.how_much||0} | Status: ${t.status} | Impacto: ${t.impact} | Esforço: ${t.effort}`).join('\n') || 'Nenhuma tarefa'}`

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-business', {
        body: { prompt },
      })

      if (fnError) throw new Error(fnError.message)
      if (fnData?.error) throw new Error(fnData.error)

      let html = fnData.html || ''
      html = html.replace(/```html|```/g, '').trim()

      const { error: insertErr } = await supabase
        .from('ai_analyses')
        .insert({ business_id: activeBiz.id, content: html, model: 'claude-sonnet-4-6' })
      if (insertErr) console.error('Erro ao salvar análise:', insertErr.message)

      const { data: newHistory } = await supabase
        .from('ai_analyses').select('*')
        .eq('business_id', activeBiz.id)
        .order('created_at', { ascending: false }).limit(5)

      setHistory(newHistory || [])
      setResult(html)
    } catch (err) {
      setError('Erro ao conectar com a IA: ' + (err.message || 'Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  if (!activeBiz) return (
    <div className="flex items-center justify-center h-full text-gemba-dim text-sm font-body">
      Selecione um negócio para gerar a análise.
    </div>
  )

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-gemba-gold">Conselheiro IA</h1>
          <p className="font-body text-sm text-gemba-dim mt-1">Diagnóstico estratégico · {activeBiz.name}</p>
        </div>
        <button onClick={handleAnalyze} disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-900 to-purple-700 border border-purple-500/40 text-purple-200 text-sm font-body font-700 px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-900/40 transition-all disabled:opacity-50">
          {loading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Analisando...' : result ? 'Gerar Nova Análise' : 'Gerar Diagnóstico'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body text-red-400">{error}</p>
        </div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-gemba-card border border-gemba-border rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center">
            <BrainCircuit className="text-purple-400" size={28} />
          </div>
          <h3 className="font-display text-lg text-gemba-dim">Pronto para analisar</h3>
          <p className="text-sm font-body text-gemba-muted max-w-md">
            Preencha o Canvas e adicione tarefas no Kanban. Clique em <strong className="text-gemba-text">"Gerar Diagnóstico"</strong> para obter uma análise SWOT completa.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-gemba-card border border-purple-500/20 rounded-2xl">
          <Loader className="text-purple-400 animate-spin" size={32} />
          <div className="text-center">
            <p className="font-body font-600 text-gemba-text">Analisando {activeBiz.name}...</p>
            <p className="text-sm font-body text-gemba-dim mt-1">Gerando diagnóstico estratégico com IA</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          <div className="bg-gemba-card border border-gemba-border rounded-2xl p-5 md:p-6"
            dangerouslySetInnerHTML={{ __html: result }} />
          {history.length > 1 && (
            <div className="bg-gemba-card border border-gemba-border rounded-2xl p-4">
              <h3 className="text-xs font-body font-700 text-gemba-dim uppercase tracking-wider mb-3">Histórico</h3>
              <div className="space-y-1">
                {history.slice(1).map(h => (
                  <button key={h.id} onClick={() => setResult(h.content)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-gemba-surface transition-colors">
                    <span className="text-xs font-mono text-gemba-dim">
                      {new Date(h.created_at).toLocaleString('pt-BR')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
