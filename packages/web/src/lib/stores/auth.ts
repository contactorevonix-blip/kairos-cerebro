import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
  tokenBalance: number
  monthlyLimit: number
  apiKey?: string  // preview only (kc_live_3a8f...d4e2)
}

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  updateBalance: (balance: number) => void
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateBalance: (balance) =>
        set((state) => ({
          user: state.user ? { ...state.user, tokenBalance: balance } : null,
        })),
      logout: () => set({ user: null }),
    }),
    { name: 'kc-auth' }
  )
)
