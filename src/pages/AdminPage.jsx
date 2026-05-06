import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import {
  Users, Plus, Loader, AlertCircle, CheckCircle,
  Shield, Eye, Edit3, Trash2, ChevronDown, ChevronUp, X
} from 'lucide-react'

const ROLE_LABELS = { admin: 'Admin', gestor: 'Gestor', analista: 'Analista' }
const ROLE_COLORS = {
  admin:    'bg-purple-500/15 text-purple-300 border-purple-500/30',
  gestor:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
  analista: 'bg-gemba-border text-gemba-dim',
}

function RoleBadge({ role }) {
  return (
    <span className={`text-xs font-body font-700 px-2 py-0.5 rounded-md border ${ROLE_COLORS[role] || ROLE_COLORS.analista}`}>
      {ROLE_LABELS[role] || role}
    </span>
  )
}

function CreateUserModal({ businesses, onClose, onCreated }) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'analista' })
  const [perms, setPerms] = useState({}) // { business_id: { can_edit, can_view_ai } }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleBiz = (id) => {
    setPerms(p => {
      if (p[id]) { const n = { ...p }; delete n[id]; return n }
      return { ...p, [id]: { can_edit: false, can_view_ai: true } }
    })
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Email e senha são obrigatórios.'); return }
    if (form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    setSaving(true); setError('')

    const business_permissions = Object.entries(perms).map(([business_id, p]) => ({
      business_id, can_edit: p.can_edit, can_view_ai: p.can_view_ai,
    }))

    const { data, error: err } = await supabase.functions.invoke('admin-create-user', {
      body: { ...form, business_permissions },
    })

    setSaving(false)
    if (err || data?.error) { setError(err?.message || data?.error); return }
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gemba-surface border border-gemba-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gemba-border sticky top-0 bg-gemba-surface">
          <h2 className="font-display text-lg text-gemba-gold">Novo Usuário</h2>
          <button onClick={onClose} className="text-gemba-dim hover:text-gemba-text"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-body text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-body font-700 text-gemba-dim mb-1.5">Nome completo</label>
              <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="João Silva"
                className="w-full bg-gemba-card border border-gemba-border rounded-xl px-3 py-2.5 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-body font-700 text-gemba-dim mb-1.5">Email</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                type="email" placeholder="joao@email.com"
                className="w-full bg-gemba-card border border-gemba-border rounded-xl px-3 py-2.5 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-body font-700 text-gemba-dim mb-1.5">Senha</label>
              <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                type="password" placeholder="mínimo 6 caracteres"
                className="w-full bg-gemba-card border border-gemba-border rounded-xl px-3 py-2.5 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-body font-700 text-gemba-dim mb-1.5">Papel</label>
              <div className="grid grid-cols-3 gap-2">
                {['admin','gestor','analista'].map(r => (
                  <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))}
                    className={`py-2 rounded-xl border text-sm font-body font-600 transition-all ${
                      form.role === r ? 'border-gemba-gold bg-gemba-border-gold text-gemba-gold' : 'border-gemba-border text-gemba-dim hover:border-gemba-dim'
                    }`}>
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gemba-muted mt-1.5 font-body">
                {form.role === 'admin' && 'Acesso total ao sistema e pode criar usuários.'}
                {form.role === 'gestor' && 'Pode editar negócios que tiver permissão.'}
                {form.role === 'analista' && 'Acesso somente leitura nos negócios permitidos.'}
              </p>
            </div>
          </div>

          {form.role !== 'admin' && businesses.length > 0 && (
            <div>
              <label className="block text-xs font-body font-700 text-gemba-dim mb-2">Acesso aos negócios</label>
              <div className="space-y-2">
                {businesses.map(b => (
                  <div key={b.id} className={`border rounded-xl p-3 transition-all ${perms[b.id] ? 'border-gemba-gold/40 bg-gemba-card' : 'border-gemba-border'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={!!perms[b.id]} onChange={() => toggleBiz(b.id)}
                        className="accent-gemba-gold" />
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                      <span className="text-sm font-body text-gemba-text flex-1">{b.name}</span>
                    </div>
                    {perms[b.id] && (
                      <div className="mt-2 ml-6 flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-body text-gemba-dim cursor-pointer">
                          <input type="checkbox" checked={perms[b.id].can_edit}
                            onChange={e => setPerms(p => ({ ...p, [b.id]: { ...p[b.id], can_edit: e.target.checked } }))}
                            className="accent-gemba-gold" />
                          <Edit3 size={11} /> Pode editar
                        </label>
                        <label className="flex items-center gap-2 text-xs font-body text-gemba-dim cursor-pointer">
                          <input type="checkbox" checked={perms[b.id].can_view_ai}
                            onChange={e => setPerms(p => ({ ...p, [b.id]: { ...p[b.id], can_view_ai: e.target.checked } }))}
                            className="accent-gemba-gold" />
                          <Shield size={11} /> Acessa Conselheiro IA
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gemba-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-body text-gemba-dim hover:text-gemba-text">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-gemba-gold text-gemba-dark text-sm font-body font-700 px-5 py-2 rounded-xl disabled:opacity-40">
            {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? 'Criando...' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin } = useAuthContext()
  const { businesses } = useBusiness()
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [expanded,   setExpanded]   = useState(null)
  const [feedback,   setFeedback]   = useState(null)
  const [deleting,   setDeleting]   = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data: profiles } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false })

    if (!profiles) { setLoading(false); return }

    // Busca permissões de cada user
    const { data: allPerms } = await supabase
      .from('business_permissions').select('*, businesses(name, color)')

    const usersWithPerms = profiles.map(p => ({
      ...p,
      permissions: allPerms?.filter(bp => bp.user_id === p.id) || [],
    }))

    setUsers(usersWithPerms)
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleDelete = async (userId) => {
    setDeleting(userId)
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: { action: 'delete', user_id: userId },
    })
    setDeleting(null)
    if (error || data?.error) {
      setFeedback({ type: 'error', msg: 'Erro ao excluir usuário.' })
    } else {
      setFeedback({ type: 'success', msg: 'Usuário removido.' })
      loadUsers()
    }
    setTimeout(() => setFeedback(null), 3000)
  }

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
      <Shield size={32} className="text-gemba-dim" />
      <p className="font-body text-gemba-dim">Acesso restrito a administradores.</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-gemba-gold">Usuários</h1>
          <p className="font-body text-sm text-gemba-dim mt-1">Gerencie acessos e permissões</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gemba-gold text-gemba-dark text-sm font-body font-700 px-4 py-2.5 rounded-xl hover:bg-gemba-gold-light transition-colors">
          <Plus size={15} /> Novo Usuário
        </button>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl p-3 mb-4 border ${
          feedback.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
        }`}>
          {feedback.type === 'success'
            ? <CheckCircle size={14} className="text-green-400" />
            : <AlertCircle size={14} className="text-red-400" />}
          <p className={`text-sm font-body ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback.msg}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader className="animate-spin text-gemba-dim" size={24} /></div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="bg-gemba-card border border-gemba-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-gemba-surface border border-gemba-border flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-display text-gemba-gold">
                    {(u.full_name || u.email)?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-body font-600 text-gemba-text truncate">
                      {u.full_name || '—'}
                    </span>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-xs font-body text-gemba-dim truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.permissions.length > 0 && (
                    <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                      className="text-gemba-dim hover:text-gemba-text transition-colors">
                      {expanded === u.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                  <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                    className="text-red-400/40 hover:text-red-400 transition-colors">
                    {deleting === u.id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>

              {expanded === u.id && u.permissions.length > 0 && (
                <div className="border-t border-gemba-border px-4 py-3">
                  <p className="text-xs font-body font-700 text-gemba-dim uppercase tracking-wider mb-2">Permissões</p>
                  <div className="space-y-1.5">
                    {u.permissions.map(p => (
                      <div key={p.id} className="flex items-center gap-3 text-xs font-body text-gemba-dim">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.businesses?.color }} />
                        <span className="flex-1">{p.businesses?.name}</span>
                        <span className={`flex items-center gap-1 ${p.can_edit ? 'text-gemba-gold' : 'text-gemba-muted'}`}>
                          <Edit3 size={10} /> {p.can_edit ? 'Editar' : 'Só leitura'}
                        </span>
                        <span className={`flex items-center gap-1 ${p.can_view_ai ? 'text-purple-400' : 'text-gemba-muted'}`}>
                          <Shield size={10} /> {p.can_view_ai ? 'IA' : 'Sem IA'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gemba-card border border-gemba-border rounded-2xl">
              <Users size={28} className="text-gemba-dim" />
              <p className="text-sm font-body text-gemba-dim">Nenhum usuário ainda. Crie o primeiro!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <CreateUserModal
          businesses={businesses}
          onClose={() => setShowModal(false)}
          onCreated={() => { loadUsers(); setFeedback({ type: 'success', msg: 'Usuário criado com sucesso!' }); setTimeout(() => setFeedback(null), 3000) }}
        />
      )}
    </div>
  )
}
