import { create } from 'zustand'
import { persist } from 'zustand/middleware'
 
export const useDarkmode = create(persist((set) => ({
  isDarkmodeEnabled: false,
  toggleDarkmode: () => set((state) => ({ isDarkmodeEnabled: !state.isDarkmodeEnabled  })),
}),{name:"darkmode"}))