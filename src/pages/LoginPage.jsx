import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Anchor, Eye, EyeOff, Loader } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode,     setMode]     = useState('login') // login | signup
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const fn = mode === 'login' ? signIn : signUp
    const { error: err } = await fn(email, password)
    if (err) setError(err.message)
    else if (mode === 'signup') setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gemba-dark flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.06)_0%,_transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gemba-card border border-gemba-border-gold shadow-gold mb-4">
            <Anchor className="w-7 h-7 text-gemba-gold" />
          </div>
          <h1 className="font-display text-4xl text-gemba-gold tracking-wide">GEMBA</h1>
          <p className="font-body text-xs tracking-[0.2em] text-gemba-dim uppercase mt-1">Holding</p>
          <p className="font-body text-sm text-gemba-dim mt-3">Portfólio de Negócios</p>
        </div>

        {/* Card */}
        <div className="bg-gemba-card border border-gemba-border rounded-2xl p-8 shadow-card">
          <h2 className="font-body text-base font-600 text-gemba-text mb-6">
            {mode === 'login' ? 'Entrar na plataforma' : 'Criar nova conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-600 text-gemba-dim uppercase tracking-wider mb-2">
                E-mail
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-gemba-surface border border-gemba-border rounded-xl px-4 py-3 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-body font-600 text-gemba-dim uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gemba-surface border border-gemba-border rounded-xl px-4 py-3 pr-12 text-sm font-body text-gemba-text placeholder-gemba-muted outline-none focus:border-gemba-gold transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gemba-dim hover:text-gemba-gold transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error   && <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gold-gradient text-gemba-dark font-body font-700 text-sm py-3 rounded-xl hover:shadow-gold-strong transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading && <Loader size={14} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              className="text-xs font-body text-gemba-dim hover:text-gemba-gold transition-colors">
              {mode === 'login' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
