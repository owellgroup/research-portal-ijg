import { NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/config"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://ijg-research-admin.vercel.app',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  })
}

export async function GET() {
  try {
    const response = await fetch(`${API_ENDPOINTS.users}/all`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch users from backend" }, { status: response.status })
    }

    const users = await response.json()
    return NextResponse.json(users, {
      headers: {
        'Access-Control-Allow-Origin': 'https://ijg-research-admin.vercel.app',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)

    // For development, return mock data if the backend is not available
    return NextResponse.json([
      { id: 1, name: "Admin User", email: "admin@example.com" },
      { id: 2, name: "Test User", email: "test@example.com" },
    ])
  }
}
