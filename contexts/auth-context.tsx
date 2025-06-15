"use client"

import { createContext, useContext, type ReactNode } from "react"
import { SessionProvider, useSession } from "next-auth/react"

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const user = session?.user
    ? {
        id: session.user.id as string,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }
    : null

  const logout = () => {
    window.location.href = "/api/auth/signout"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
