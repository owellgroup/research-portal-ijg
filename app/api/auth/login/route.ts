import { NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/config"

export async function POST(request: Request) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Try to connect to the backend API
    const response = await fetch(
      `${API_ENDPOINTS.login}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: password.trim()
        }),
      },
    )

    console.log('Backend response status:', response.status)

    let data;
    try {
      data = await response.json()
      console.log('Backend response data:', data)
    } catch (error) {
      console.error('Failed to parse backend response:', error)
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || "Invalid credentials or server error",
          details: data
        },
        { status: response.status }
      )
    }

    // If we get here, the login was successful
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.id || 1,
        name: data.name || "Admin User",
        email: data.email || email,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': 'https://ijg-research-admin.vercel.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        error: "Could not connect to the backend server",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
