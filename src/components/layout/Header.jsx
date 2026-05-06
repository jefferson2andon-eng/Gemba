import { useState } from 'react'
import { Anchor, ChevronDown, Plus, LogOut, Menu, X } from 'lucide-react'
import { useBusiness } from '../../context/BusinessContext'
import { useAuth } from '../../hooks/useAuth'

export default function Header({ onMenuToggle, menuOpen }) {
  const { businesses, activeBiz, setActiveBiz, createBusiness } = useBusiness()
  const { signOut, user } = useAuth()
  const [dropOpen,  setDropOpen]  = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [newName,   setNewName]   = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await createBusiness(newName.trim())
    setNewName(''); setCreating(false); setDropOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-gemba-surface border-b border-gemba-border flex items-center px-4 gap-3">
      {/* Mobile menu toggle */}
      <button onClick={onMenuToggle} className="md:hidden text-gemba-dim hover:text-gemba-gold transition-colors">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Anchor className="w-5 h-5 text-gemba-gold" />
        <span className="font-display text-lg text-gemba-gold tracking-wider hidden sm:block">GEMBA</span>
      </div>

      {/* Business selector */}
      <div className="relative ml-2 flex-1 max-w-xs">
        <button onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-2 bg-gemba-card border border-gemba-border hover:border-gemba-border-gold rounded-xl px-3 py-2 transition-all w-full max-w-[220px]">
          {activeBiz && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: activeBiz.color }} />}
          <span className="text-sm font-body text-gemba-text truncate flex-1 text-left">
            {activeBiz?.name ?? 'Selecionar negócio'}
          </span>
          <ChevronDown size={14} className={`text-gemba-dim flex-shrink-0 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-gemba-card border border-gemba-border rounded-xl shadow-card z-50 overflow-hidden animate-slide-up">
            <div className="p-1 max-h-56 overflow-y-auto">
              {businesses.map(b => (
                <button key={b.id}
                  onClick={() => { setActiveBiz(b); setDropOpen(false) }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-body transition-colors text-left ${activeBiz?.id === b.id ? 'bg-gemba-border-gold text-gemba-gold' : 'text-gemba-text hover:bg-gemba-border'}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                  <span className="truncate flex-1">{b.name}</span>
                  {b.status !== 'ativo' && (
                    <span className="text-xs text-gemba-dim capitalize">{b.status}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gemba-border p-2">
              {creating ? (
                <form onSubmit={handleCreate} className="flex gap-2">
                  <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Nome do negócio..."
                    className="flex-1 bg-gemba-surface border border-gemba-border rounded-lg px-2 py-1.5 text-xs font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold" />
                  <button type="submit" className="bg-gemba-gold text-gemba-dark text-xs font-700 px-2 py-1.5 rounded-lg">OK</button>
                </form>
              ) : (
                <button onClick={() => setCreating(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-body text-gemba-gold hover:bg-gemba-border-gold transition-colors">
                  <Plus size={14} />
                  Novo negócio
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:block text-xs font-body text-gemba-dim truncate max-w-[140px]">{user?.email}</span>
        <button onClick={signOut} className="text-gemba-dim hover:text-red-400 transition-colors" title="Sair">
          <LogOut size={16} />
        </button>
      </div>

      {dropOpen && <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />}
    </header>
  )
}
