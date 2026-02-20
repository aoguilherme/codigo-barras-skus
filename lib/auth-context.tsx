"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"

interface User {
  id: number
  username: string
  nome?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = "auth-user"
const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)

  // Logout: clear everything
  const logout = useCallback(() => {
    setUser(null)
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    window.location.href = "/login"
  }, [])

  // Login: call API, set state + sessionStorage
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (res.ok && data.success && data.user) {
        setUser(data.user)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
        return { success: true }
      }
      return { success: false, error: data.error || "Credenciais inválidas" }
    } catch {
      return { success: false, error: "Erro ao conectar com o servidor" }
    }
  }, [])

  // On mount: restore from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {}
    setIsLoading(false)
  }, [])

  // Inactivity timer + beforeunload
  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(logout, INACTIVITY_TIMEOUT)
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
    events.forEach(e => document.addEventListener(e, resetTimer, true))
    
    const handleUnload = () => {
      sessionStorage.removeItem(SESSION_KEY)
    }
    window.addEventListener("beforeunload", handleUnload)
    
    resetTimer()

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer, true))
      window.removeEventListener("beforeunload", handleUnload)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [user, logout])

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
