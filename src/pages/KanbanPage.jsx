import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import { useBusiness } from '../context/BusinessContext'
import { Plus, X, Loader, GripVertical, Calendar, DollarSign } from 'lucide-react'

const COLS = [
  { id: 'todo',  label: 'A Fazer',    color: '#7a7870' },
  { id: 'doing', label: 'Executando', color: '#c9a84c' },
  { id: 'done',  label: 'Concluído',  color: '#2e9e7a' },
]

const EMPTY_TASK = { what:'', why:'', who:'', when_date:'', where_task:'', how:'', how_much:'', impact:50, effort:50, status:'todo' }

function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="bg-gemba-surface border border-gemba-border rounded-xl p-3 cursor-pointer hover:border-gemba-border-gold transition-all group"
      onClick={onClick}>
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="text-gemba-muted mt-0.5 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body font-600 text-gemba-text leading-snug">{task.what}</p>
          {task.who && <p className="text-xs font-body text-gemba-dim mt-1">👤 {task.who}</p>}
          <div className="flex items-center gap-3 mt-2">
            {task.when_date && (
              <span className="flex items-center gap-1 text-xs font-mono text-gemba-dim">
                <Calendar size={10} />{new Date(task.when_date).toLocaleDateString('pt-BR')}
              </span>
            )}
            {task.how_much > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono text-gemba-gold">
                <DollarSign size={10} />R$ {Number(task.how_much).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskModal({ task, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(task || EMPTY_TASK)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.what.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  const fields5w2h = [
    { key: 'what',       label: 'O Quê (What)?',    placeholder: 'O que será feito?',           required: true  },
    { key: 'why',        label: 'Por Quê (Why)?',   placeholder: 'Por que é necessário?',        required: false },
    { key: 'who',        label: 'Quem (Who)?',      placeholder: 'Quem é responsável?',          required: false },
    { key: 'when_date',  label: 'Quando (When)?',   placeholder: '',                             type: 'date'    },
    { key: 'where_task', label: 'Onde (Where)?',    placeholder: 'Onde será executado?',         required: false },
    { key: 'how',        label: 'Como (How)?',      placeholder: 'Como será feito?',             required: false },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-gemba-card border border-gemba-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up shadow-card" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gemba-border">
          <h2 className="font-display text-lg text-gemba-gold">{task?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="text-gemba-dim hover:text-gemba-text"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-body font-600 text-gemba-dim uppercase tracking-wider mb-2">Status</label>
            <div className="flex gap-2">
              {COLS.map(c => (
                <button key={c.id} onClick={() => set('status', c.id)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-body font-600 transition-all border ${form.status === c.id ? 'border-transparent' : 'border-gemba-border text-gemba-dim'}`}
                  style={form.status === c.id ? { background: `${c.color}20`, color: c.color, borderColor: `${c.color}40` } : {}}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5W2H fields */}
          {fields5w2h.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-body font-600 text-gemba-dim uppercase tracking-wider mb-1.5">
                {f.label} {f.required && <span className="text-gemba-gold">*</span>}
              </label>
              <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-gemba-surface border border-gemba-border rounded-xl px-3 py-2.5 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold transition-colors" />
            </div>
          ))}

          {/* How Much */}
          <div>
            <label className="block text-xs font-body font-600 text-gemba-dim uppercase tracking-wider mb-1.5">
              Quanto Custa (How Much)? <span className="text-gemba-gold">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gemba-dim text-sm font-mono">R$</span>
              <input type="number" min="0" value={form.how_much || ''} onChange={e => set('how_much', e.target.value)}
                placeholder="0,00"
                className="w-full bg-gemba-surface border border-gemba-border rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold transition-colors" />
            </div>
          </div>

          {/* Impact & Effort */}
          <div className="grid grid-cols-2 gap-4">
            {[{ k:'impact', l:'Impacto (0-100)', c:'#2e9e7a' }, { k:'effort', l:'Esforço (0-100)', c:'#e05555' }].map(s => (
              <div key={s.k}>
                <label className="block text-xs font-body font-600 text-gemba-dim uppercase tracking-wider mb-1.5">
                  {s.l}: <span className="font-mono" style={{color:s.c}}>{form[s.k]}</span>
                </label>
                <input type="range" min="0" max="100" value={form[s.k]} onChange={e => set(s.k, +e.target.value)}
                  className="w-full accent-gemba-gold" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          {task?.id && (
            <button onClick={() => { onDelete(task.id); onClose() }}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-body font-600 hover:bg-red-500/10 transition-colors">
              Excluir
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gemba-border text-gemba-dim text-sm font-body font-600 hover:border-gemba-text transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !form.what.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gold-gradient text-gemba-dark text-sm font-body font-700 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-gold transition-all">
            {saving && <Loader size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { activeBiz } = useBusiness()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | 'new' | task object

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (!activeBiz) return
    setLoading(true)
    supabase.from('tasks').select('*').eq('business_id', activeBiz.id).order('position')
      .then(({ data }) => { setTasks(data || []); setLoading(false) })
  }, [activeBiz?.id])

  const saveTask = async (form) => {
    if (form.id) {
      const { data } = await supabase.from('tasks').update(form).eq('id', form.id).select().single()
      if (data) setTasks(p => p.map(t => t.id === form.id ? data : t))
    } else {
      const { data } = await supabase.from('tasks').insert({ ...form, business_id: activeBiz.id, position: tasks.length }).select().single()
      if (data) setTasks(p => [...p, data])
    }
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(p => p.filter(t => t.id !== id))
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = tasks.findIndex(t => t.id === active.id)
    const newIdx = tasks.findIndex(t => t.id === over.id)
    const newTasks = arrayMove(tasks, oldIdx, newIdx)
    setTasks(newTasks)
    await Promise.all(newTasks.map((t, i) =>
      supabase.from('tasks').update({ position: i }).eq('id', t.id)
    ))
  }

  if (!activeBiz) return <div className="flex items-center justify-center h-full text-gemba-dim text-sm font-body">Selecione um negócio.</div>
  if (loading)    return <div className="flex items-center justify-center h-full"><Loader className="text-gemba-gold animate-spin" size={24} /></div>

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-gemba-gold">Plano de Ação</h1>
          <p className="font-body text-sm text-gemba-dim mt-1">Metodologia 5W2H · {activeBiz.name}</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 bg-gold-gradient text-gemba-dark text-sm font-body font-700 px-4 py-2.5 rounded-xl hover:shadow-gold transition-all">
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id)
            return (
              <div key={col.id} className="flex-shrink-0 w-72 md:w-80">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-body font-700 text-gemba-text">{col.label}</span>
                  <span className="ml-auto text-xs font-mono text-gemba-dim bg-gemba-card px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="bg-gemba-card border border-gemba-border rounded-2xl p-3 min-h-32 space-y-2">
                  <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map(t => (
                      <TaskCard key={t.id} task={t} onClick={() => setModal(t)} />
                    ))}
                  </SortableContext>
                  {colTasks.length === 0 && (
                    <p className="text-xs font-body text-gemba-muted text-center py-4">Nenhuma tarefa aqui</p>
                  )}
                  <button onClick={() => setModal({ ...EMPTY_TASK, status: col.id })}
                    className="flex items-center gap-1.5 text-xs font-body text-gemba-dim hover:text-gemba-gold transition-colors w-full pt-1">
                    <Plus size={12} /> Adicionar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </DndContext>

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
