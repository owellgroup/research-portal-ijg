import { NextResponse } from "next/server"
import { mockDocuments } from "../mock-data"

const CACHE_DURATION = 60 * 5 // 5 minutes in seconds
const FETCH_TIMEOUT = 10000 // 10 seconds timeout
let cachedDocuments: any[] | null = null
let lastFetchTime = 0
let isFetching = false

export async function GET() {
  try {
    // Check if we have cached documents that are still valid
    const now = Date.now() / 1000
    if (cachedDocuments && (now - lastFetchTime) < CACHE_DURATION) {
      return NextResponse.json(cachedDocuments)
    }

    // Prevent concurrent fetches
    if (isFetching) {
      return cachedDocuments 
        ? NextResponse.json(cachedDocuments)
        : NextResponse.json(mockDocuments)
    }

    isFetching = true
    
    // Try to fetch all documents directly from the backend with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    
    const response = await fetch("https://ijgapis.onrender.com/api/documents", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (response.ok) {
      const documents = await response.json()
      // Cache the successful response with validation
      if (Array.isArray(documents)) {
        cachedDocuments = documents
        lastFetchTime = now
      }
      isFetching = false
      return NextResponse.json(documents)
    }

    // If direct fetch fails, try fetching by categories with timeout
    const categoriesController = new AbortController()
    const categoriesTimeout = setTimeout(() => categoriesController.abort(), FETCH_TIMEOUT)
    
    const categoriesResponse = await fetch("https://ijgapis.onrender.com/api/categories", {
      signal: categoriesController.signal
    }).finally(() => clearTimeout(categoriesTimeout))
    
    if (!categoriesResponse.ok) {
      isFetching = false
      throw new Error("Failed to fetch categories")
    }

    const categories = await categoriesResponse.json()
    const allDocuments: any[] = []

    // Fetch documents for each category in parallel with timeout
    const documentPromises = categories.map(async (category: any) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
        
        const response = await fetch(`https://ijgapis.onrender.com/api/documents/category/${category.id}`, {
          signal: controller.signal
        }).finally(() => clearTimeout(timeout))
        
        if (response.ok) {
          const documents = await response.json()
          return Array.isArray(documents) ? documents : []
        }
        return []
      } catch (error) {
        console.error(`Error fetching documents for category ${category.id}:`, error)
        return []
      }
    })

    const results = await Promise.all(documentPromises)
    const documents = results.flat()

    // Cache the successful response with validation
    if (Array.isArray(documents)) {
      cachedDocuments = documents
      lastFetchTime = now
    }
    isFetching = false
    
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
