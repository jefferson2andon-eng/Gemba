import { NavLink } from 'react-router-dom'
import { LayoutGrid, Kanban, Crosshair, BarChart3, BrainCircuit, Settings, Users } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

export default function BottomNav() {
  const { isAdmin } = useAuthContext()

  const NAV = [
    { to: '/canvas',      icon: LayoutGrid,   label: 'Canvas'  },
    { to: '/kanban',      icon: Kanban,       label: 'Plano'   },
    { to: '/matrix',      icon: Crosshair,    label: 'Matriz'  },
    { to: '/comparative', icon: BarChart3,    label: 'Dados'   },
    { to: '/ai',          icon: BrainCircuit, label: 'IA'      },
    ...(isAdmin ? [{ to: '/admin', icon: Users, label: 'Users' }] : []),
    { to: '/settings',    icon: Settings,     label: 'Config'  },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gemba-surface border-t border-gemba-border md:hidden">
      <div className="flex">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center py-2 gap-1 text-xs font-body transition-colors
              ${isActive ? 'text-gemba-gold' : 'text-gemba-dim'}
            `}>
            <Icon size={18} />
            <span className="text-[9px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
