import { useState } from 'react'
import { useBusiness } from '../context/BusinessContext'
import { Loader, Save, Trash2, AlertCircle, CheckCircle, Plus } from 'lucide-react'

const COLORS = [
  '#c9a84c', '#2e9e7a', '#3b7dd8', '#9b5de5',
  '#e05555', '#e87c3e', '#2aa8c0', '#7a7870',
]

const STATUS_OPTIONS = [
  { value: 'ativo',     label: 'Ativo',     desc: 'Negócio em operação' },
  { value: 'pausado',   label: 'Pausado',   desc: 'Temporariamente parado' },
  { value: 'encerrado', label: 'Encerrado', desc: 'Negócio encerrado' },
]

export default function SettingsPage() {
  const { businesses, activeBiz, setActiveBiz, createBusiness, updateBusiness, deleteBusiness } = useBusiness()

  const [form,       setForm]       = useState({ name: activeBiz?.name || '', color: activeBiz?.color || '#c9a84c', status: activeBiz?.status || 'ativo' })
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [feedback,   setFeedback]   = useState(null) // { type: 'success'|'error', msg }
  const [confirmDel, setConfirmDel] = useState(false)
  const [newBizName, setNewBizName] = useState('')
  const [creating,   setCreating]   = useState(false)

  // Sync form when active biz changes
  const handleSelectBiz = (biz) => {
    setActiveBiz(biz)
    setForm({ name: biz.name, color: biz.color, status: biz.status })
    setFeedback(null)
    setConfirmDel(false)
  }

  const handleSave = async () => {
    if (!activeBiz || !form.name.trim()) return
    setSaving(true)
    setFeedback(null)
    const { error } = await updateBusiness(activeBiz.id, {
      name:   form.name.trim(),
      color:  form.color,
      status: form.status,
    })
    setSaving(false)
    if (error) setFeedback({ type: 'error', msg: 'Erro ao salvar: ' + error.message })
    else       setFeedback({ type: 'success', msg: 'Alterações salvas com sucesso.' })
  }

  const handleDelete = async () => {
    if (!activeBiz) return
    setDeleting(true)
    const { error } = await deleteBusiness(activeBiz.id)
    setDeleting(false)
    if (error) {
      setFeedback({ type: 'error', msg: 'Erro ao excluir: ' + error.message })
      setConfirmDel(false)
    }
    // On success, BusinessContext already switched activeBiz; reset form
    setForm({ name: '', color: '#c9a84c', status: 'ativo' })
    setConfirmDel(false)
  }

  const handleCreate = async () => {
    if (!newBizName.trim()) return
    setCreating(true)
    const { data, error } = await createBusiness(newBizName.trim())
    setCreating(false)
    if (error) { setFeedback({ type: 'error', msg: 'Erro ao criar: ' + error.message }); return }
    if (data) {
      setNewBizName('')
      setForm({ name: data.name, color: data.color, status: data.status })
      setFeedback({ type: 'success', msg: `Negócio "${data.name}" criado com sucesso.` })
    }
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-gemba-gold">Configurações</h1>
        <p className="font-body text-sm text-gemba-dim mt-1">Gerencie os negócios do portfólio</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-start gap-3 rounded-xl p-4 mb-5 border ${
          feedback.type === 'success'
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          {feedback.type === 'success'
            ? <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
          <p className={`text-sm font-body ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback.msg}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-[200px_1fr] gap-5">

        {/* Sidebar: lista de negócios */}
        <div className="bg-gemba-card border border-gemba-border rounded-2xl overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-gemba-border">
            <p className="text-xs font-body font-700 text-gemba-dim uppercase tracking-wider">Negócios</p>
          </div>
          <div className="p-1 max-h-64 overflow-y-auto">
            {businesses.map(b => (
              <button key={b.id}
                onClick={() => handleSelectBiz(b)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-body transition-colors text-left ${
                  activeBiz?.id === b.id ? 'bg-gemba-border-gold text-gemba-gold' : 'text-gemba-text hover:bg-gemba-surface'
                }`}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                <span className="truncate flex-1">{b.name}</span>
              </button>
            ))}
            {businesses.length === 0 && (
              <p className="text-xs text-gemba-muted px-3 py-3">Nenhum negócio ainda.</p>
            )}
          </div>

          {/* Novo negócio */}
          <div className="border-t border-gemba-border p-2">
            <div className="flex gap-1">
              <input
                value={newBizName}
                onChange={e => setNewBizName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Novo negócio..."
                className="flex-1 bg-gemba-surface border border-gemba-border rounded-lg px-2 py-1.5 text-xs font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold min-w-0"
              />
              <button onClick={handleCreate} disabled={creating || !newBizName.trim()}
                className="bg-gemba-gold text-gemba-dark text-xs font-700 px-2.5 py-1.5 rounded-lg disabled:opacity-40 flex-shrink-0">
                {creating ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Form: editar negócio ativo */}
        {activeBiz ? (
          <div className="bg-gemba-card border border-gemba-border rounded-2xl p-5 space-y-5">
            <p className="text-xs font-body font-700 text-gemba-dim uppercase tracking-wider">Editar negócio</p>

            {/* Nome */}
            <div>
              <label className="block text-xs font-body font-700 text-gemba-dim mb-2">Nome</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-gemba-surface border border-gemba-border rounded-xl px-4 py-3 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold transition-colors"
                placeholder="Nome do negócio"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-xs font-body font-700 text-gemba-dim mb-2">Cor de identificação</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-xl transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-gemba-card scale-110' : 'hover:scale-105'}`}
                    style={{ background: c, ringColor: c }}
                  />
                ))}
                {/* Custom color */}
                <label className="w-8 h-8 rounded-xl border-2 border-dashed border-gemba-border flex items-center justify-center cursor-pointer hover:border-gemba-gold transition-colors overflow-hidden relative"
                  title="Cor personalizada">
                  <input type="color" value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <span className="text-gemba-dim text-xs">+</span>
                </label>
                <div className="w-8 h-8 rounded-xl border-2 border-gemba-border flex-shrink-0"
                  style={{ background: form.color }} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-body font-700 text-gemba-dim mb-2">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setForm(p => ({ ...p, status: opt.value }))}
                    className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${
                      form.status === opt.value
                        ? 'border-gemba-gold bg-gemba-border-gold'
                        : 'border-gemba-border hover:border-gemba-dim'
                    }`}>
                    <span className={`text-sm font-body font-600 ${form.status === opt.value ? 'text-gemba-gold' : 'text-gemba-text'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs font-body text-gemba-dim mt-0.5 leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gemba-border">
              {!confirmDel ? (
                <button onClick={() => setConfirmDel(true)}
                  className="flex items-center gap-1.5 text-xs font-body text-red-400/60 hover:text-red-400 transition-colors">
                  <Trash2 size={13} /> Excluir negócio
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-red-400">Confirmar exclusão?</span>
                  <button onClick={handleDelete} disabled={deleting}
                    className="text-xs font-body font-700 text-red-400 hover:text-red-300 transition-colors">
                    {deleting ? 'Excluindo...' : 'Sim, excluir'}
                  </button>
                  <button onClick={() => setConfirmDel(false)}
                    className="text-xs font-body text-gemba-dim hover:text-gemba-text">
                    Cancelar
                  </button>
                </div>
              )}

              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 bg-gemba-gold text-gemba-dark text-sm font-body font-700 px-4 py-2 rounded-xl hover:bg-gemba-gold-light transition-colors disabled:opacity-40">
                {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gemba-card border border-gemba-border rounded-2xl p-8 flex items-center justify-center">
            <p className="text-sm font-body text-gemba-dim">Selecione um negócio para editar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
