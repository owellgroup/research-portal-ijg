import { NextResponse } from "next/server"
import { mockDocuments } from "../mock-data"

const CACHE_DURATION = 60 * 5 // 5 minutes in seconds
let cachedDocuments: any[] | null = null
let lastFetchTime = 0

export async function GET() {
  try {
    // Check if we have cached documents that are still valid
    const now = Date.now() / 1000
    if (cachedDocuments && (now - lastFetchTime) < CACHE_DURATION) {
      return NextResponse.json(cachedDocuments)
    }

    // Try to fetch all documents directly first
    const response = await fetch("https://ijgapis.onrender.com/api/documents/all", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const documents = await response.json()
      // Cache the successful response
      cachedDocuments = documents
      lastFetchTime = now
      return NextResponse.json(documents)
    }

    // If direct fetch fails, try fetching by categories
    const categoriesResponse = await fetch("https://ijgapis.onrender.com/api/categories")
    if (!categoriesResponse.ok) {
      throw new Error("Failed to fetch categories")
    }

    const categories = await categoriesResponse.json()
    const allDocuments: any[] = []

    // Fetch documents for each category in parallel
    const documentPromises = categories.map(async (category: any) => {
      try {
        const response = await fetch(`https://ijgapis.onrender.com/api/documents/category/${category.id}`)
        if (response.ok) {
          const documents = await response.json()
          return documents
        }
        return []
      } catch (error) {
        console.error(`Error fetching documents for category ${category.id}:`, error)
        return []
      }
    })

    const results = await Promise.all(documentPromises)
    const documents = results.flat()

    // Cache the successful response
    cachedDocuments = documents
    lastFetchTime = now

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    
    // If we have cached documents, return them even if they're stale
    if (cachedDocuments) {
      return NextResponse.json(cachedDocuments)
    }

    // Return mock data as a last resort
    return NextResponse.json(mockDocuments)
  }
}
