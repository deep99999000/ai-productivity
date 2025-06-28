// store/useUser.ts
import { create } from 'zustand'

type UserStore = {
  user: number
  setUser: (id: number) => void
  logout: () => void
}

const useUser = create<UserStore>((set) => ({
  user: 0,
  setUser: (id) => set({ user: id }),
  logout: () => set({ user: 0 }),
}))

export default useUser
