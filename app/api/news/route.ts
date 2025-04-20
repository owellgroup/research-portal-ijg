import { NextResponse } from "next/server"
import { mockNews } from "../mock-data"
import { API_ENDPOINTS } from "@/lib/config"

export async function GET() {
  try {
    const response = await fetch(API_ENDPOINTS.news)

    if (!response.ok) {
      throw new Error("Failed to fetch news from backend")
    }

    const news = await response.json()
    return NextResponse.json(news)
  } catch (error) {
    console.error("Error fetching news:", error)

    // Return mock data for development
    return NextResponse.json(mockNews)
  }
}
