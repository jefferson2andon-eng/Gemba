import { NavLink } from 'react-router-dom'
import { LayoutGrid, Kanban, Crosshair, BarChart3, BrainCircuit, Settings, Users } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

const NAV = [
  { to: '/canvas',      icon: LayoutGrid,   label: 'Canvas'         },
  { to: '/kanban',      icon: Kanban,       label: 'Plano de Ação'  },
  { to: '/matrix',      icon: Crosshair,    label: 'Matriz'         },
  { to: '/comparative', icon: BarChart3,    label: 'Comparativo'    },
  { to: '/ai',          icon: BrainCircuit, label: 'Conselheiro IA' },
]

export default function Sidebar({ open, onClose }) {
  const { isAdmin, profile } = useAuthContext()

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-14 left-0 bottom-0 z-40 w-56 bg-gemba-surface border-r border-gemba-border
        flex flex-col py-4 transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-500 transition-all
                ${isActive ? 'bg-gemba-border-gold text-gemba-gold border border-gemba-border-gold' : 'text-gemba-dim hover:text-gemba-text hover:bg-gemba-card'}
              `}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-2 space-y-0.5 border-t border-gemba-border pt-2">
          {isAdmin && (
            <NavLink to="/admin" onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-500 transition-all
                ${isActive ? 'bg-gemba-border-gold text-gemba-gold border border-gemba-border-gold' : 'text-gemba-dim hover:text-gemba-text hover:bg-gemba-card'}
              `}>
              <Users size={16} />Usuários
            </NavLink>
          )}
          <NavLink to="/settings" onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-500 transition-all
              ${isActive ? 'bg-gemba-border-gold text-gemba-gold border border-gemba-border-gold' : 'text-gemba-dim hover:text-gemba-text hover:bg-gemba-card'}
            `}>
            <Settings size={16} />Configurações
          </NavLink>
          <div className="px-1 pt-2 border-t border-gemba-border mt-1">
            <p className="text-xs font-body text-gemba-muted truncate">{profile?.full_name || profile?.email}</p>
            <p className="text-xs font-mono text-gemba-muted/50 mt-0.5">v1.1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
