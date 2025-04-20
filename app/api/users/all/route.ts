import { NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/config"

export async function GET() {
  try {
    const response = await fetch(`${API_ENDPOINTS.users}/all`)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch users from backend" }, { status: response.status })
    }

    const users = await response.json()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)

    // For development, return mock data if the backend is not available
    return NextResponse.json([
      { id: 1, name: "Admin User", email: "admin@example.com" },
      { id: 2, name: "Test User", email: "test@example.com" },
    ])
  }
}
