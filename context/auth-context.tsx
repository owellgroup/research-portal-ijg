"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { login as apiLogin } from "@/lib/api/users"
import type { User } from "@/types/user"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  isLoading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user")
    const storedAuth = localStorage.getItem("isAuthenticated")
    
    if (storedUser && storedAuth === "true") {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        // Clear invalid stored data
        localStorage.removeItem("user")
        localStorage.removeItem("isAuthenticated")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Auth context: Attempting login')
      const response = await apiLogin(email, password)
      console.log('Auth context: Login response:', response)

      if (response.success) {
        // Create a basic user object since the backend only returns a success message
        const userData: User = {
          id: 0, // This will be updated when we fetch the user profile
          email: email,
          name: email.split('@')[0], // Temporary name based on email
          password: '' // Don't store the password
        }

        setUser(userData)
        setIsAuthenticated(true)
        
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("isAuthenticated", "true")
        
        // Redirect to dashboard
        router.push('/dashboard')
        return true
      }

      console.log('Auth context: Login failed - invalid credentials')
      return false
    } catch (error) {
      console.error("Auth context: Login error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    // Clear all auth-related data from localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
