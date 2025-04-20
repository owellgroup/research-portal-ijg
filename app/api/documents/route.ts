import { NextResponse } from "next/server"
import { mockDocuments } from "../mock-data"

export async function GET() {
  try {
    // Since there's no direct endpoint for all documents, we'd need to
    // fetch categories first and then documents for each category
    // For simplicity in fixing the immediate issue, we'll use mock data

    const categoriesResponse = await fetch("http://localhost:8181/api/categories")

    if (!categoriesResponse.ok) {
      throw new Error("Failed to fetch categories")
    }

    const categories = await categoriesResponse.json()
    let allDocuments = []

    for (const category of categories) {
      const response = await fetch(`http://localhost:8181/api/documents/category/${category.id}`)
      if (response.ok) {
        const documents = await response.json()
        allDocuments = [...allDocuments, ...documents]
      }
    }

    return NextResponse.json(allDocuments)
  } catch (error) {
    console.error("Error fetching documents:", error)

    // Return mock data for development
    return NextResponse.json(mockDocuments)
  }
}
