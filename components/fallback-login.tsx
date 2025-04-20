"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function FallbackLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleDemoLogin = async () => {
    setIsLoading(true)

    try {
      // Create a mock user directly without calling the backend
      const mockUser = {
        id: 1,
        name: "Demo Admin",
        email: "admin@example.com",
      }

      // Manually set the user in auth context
      localStorage.setItem("user", JSON.stringify(mockUser))
      window.location.href = "/dashboard"
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-gray-500 mb-4">
        Backend connection failed. You can use the demo mode to explore the admin panel with mock data.
      </p>
      <Button onClick={handleDemoLogin} className="bg-[#004c98] hover:bg-[#003a75]" disabled={isLoading}>
        {isLoading ? "Loading..." : "Enter Demo Mode"}
      </Button>
    </div>
  )
}
