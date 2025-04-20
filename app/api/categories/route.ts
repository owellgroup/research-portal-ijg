import { NextResponse } from "next/server"
import { mockCategories } from "../mock-data"
import { API_ENDPOINTS } from "@/lib/config"

export async function GET() {
  try {
    const response = await fetch(API_ENDPOINTS.categories)

    if (!response.ok) {
      throw new Error("Failed to fetch categories from backend")
    }

    const categories = await response.json()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)

    // Return mock data for development
    return NextResponse.json(mockCategories)
  }
}
