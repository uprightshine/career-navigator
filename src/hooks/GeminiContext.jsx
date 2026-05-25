import { createContext, useContext, useState, useCallback } from 'react'
import { useGemini } from './useGemini'

const GeminiContext = createContext(null)

export function useGeminiContext() {
  return useContext(GeminiContext)
}

export function GeminiProvider({ children }) {
  const gemini = useGemini()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return (
    <GeminiContext.Provider value={{ ...gemini, isDrawerOpen, openDrawer, closeDrawer }}>
      {children}
    </GeminiContext.Provider>
  )
}
