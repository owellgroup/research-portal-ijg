import type { News } from "@/types/news"

const API_URL = "https://ijgapis.onrender.com/api/news"

export async function getAllNews(): Promise<News[]> {
  try {
    const response = await fetch("/api/news")

    if (!response.ok) {
      throw new Error("Failed to fetch news")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

export async function getNewsById(id: number): Promise<News> {
  const response = await fetch(`${API_URL}/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch news with ID ${id}`)
  }

  return response.json()
}

export async function createNews(news: { title: string; description: string }): Promise<News> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(news),
  })

  if (!response.ok) {
    throw new Error("Failed to create news")
  }

  return response.json()
}

export async function updateNews(id: number, news: { title: string; description: string }): Promise<News> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(news),
  })

  if (!response.ok) {
    throw new Error(`Failed to update news with ID ${id}`)
  }

  return response.json()
}

export async function deleteNews(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete news with ID ${id}`)
  }
}
