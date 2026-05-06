import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const BusinessContext = createContext(null)

export function BusinessProvider({ children, user }) {
  const [businesses, setBusinesses] = useState([])
  const [activeBiz,  setActiveBiz]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const fetchBusinesses = useCallback(async () => {
    if (!user) return
    setError(null)
    const { data, error: err } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: true })

    if (err) {
      console.error('Erro ao carregar negócios:', err.message)
      setError('Não foi possível carregar os negócios. Verifique a conexão.')
      setLoading(false)
      return
    }

    setBusinesses(data || [])
    setActiveBiz(prev => {
      if (prev) return data?.find(b => b.id === prev.id) ?? (data?.[0] || null)
      return data?.[0] || null
    })
    setLoading(false)
  }, [user])

  useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

  const createBusiness = async (name) => {
    const { data, error: err } = await supabase
      .from('businesses')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (err) {
      console.error('Erro ao criar negócio:', err.message)
      return { data: null, error: err }
    }

    setBusinesses(prev => [...prev, data])
    setActiveBiz(data)
    return { data, error: null }
  }

  const updateBusiness = async (id, updates) => {
    const { data, error: err } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (err) {
      console.error('Erro ao atualizar negócio:', err.message)
      return { data: null, error: err }
    }

    setBusinesses(prev => prev.map(b => b.id === id ? data : b))
    if (activeBiz?.id === id) setActiveBiz(data)
    return { data, error: null }
  }

  const deleteBusiness = async (id) => {
    const { error: err } = await supabase.from('businesses').delete().eq('id', id)

    if (err) {
      console.error('Erro ao excluir negócio:', err.message)
      return { error: err }
    }

    const remaining = businesses.filter(b => b.id !== id)
    setBusinesses(remaining)
    if (activeBiz?.id === id) setActiveBiz(remaining[0] || null)
    return { error: null }
  }

  return (
    <BusinessContext.Provider value={{
      businesses, activeBiz, setActiveBiz,
      loading, error,
      createBusiness, updateBusiness,
      deleteBusiness, refreshBusinesses: fetchBusinesses,
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export const useBusiness = () => {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
