import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { BusinessProvider } from './context/BusinessContext'
import LoginPage      from './pages/LoginPage'
import CanvasPage     from './pages/CanvasPage'
import KanbanPage     from './pages/KanbanPage'
import MatrixPage     from './pages/MatrixPage'
import ComparativePage from './pages/ComparativePage'
import AIAdvisorPage  from './pages/AIAdvisorPage'
import SettingsPage   from './pages/SettingsPage'
import AdminPage      from './pages/AdminPage'
import Header         from './components/layout/Header'
import Sidebar        from './components/layout/Sidebar'
import BottomNav      from './components/layout/BottomNav'
import { Loader, Anchor } from 'lucide-react'

function AppShell({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <AuthProvider>
      <BusinessProvider user={user}>
        <div className="min-h-screen bg-gemba-dark">
          <Header onMenuToggle={() => setMenuOpen(o => !o)} menuOpen={menuOpen} />
          <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
          <BottomNav />
          <main className="md:pl-56 pt-14 pb-16 md:pb-0 min-h-screen">
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
              <Routes>
                <Route path="/"            element={<Navigate to="/canvas" replace />} />
                <Route path="/canvas"      element={<CanvasPage />}      />
                <Route path="/kanban"      element={<KanbanPage />}      />
                <Route path="/matrix"      element={<MatrixPage />}      />
                <Route path="/comparative" element={<ComparativePage />} />
                <Route path="/ai"          element={<AIAdvisorPage />}   />
                <Route path="/settings"    element={<SettingsPage />}    />
                <Route path="/admin"       element={<AdminPage />}       />
              </Routes>
            </div>
          </main>
        </div>
      </BusinessProvider>
    </AuthProvider>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gemba-dark flex flex-col items-center justify-center gap-4">
      <Anchor className="text-gemba-gold animate-pulse" size={32} />
      <Loader className="text-gemba-dim animate-spin" size={20} />
    </div>
  )

  return (
    <BrowserRouter>
      {!user
        ? <Routes><Route path="*" element={<LoginPage />} /></Routes>
        : <AppShell user={user} />
      }
    </BrowserRouter>
  )
}
