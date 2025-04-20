import type { Category } from "@/types/category"

const API_URL = "https://ijgapis.onrender.com/api/categories"

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories")

    if (!response.ok) {
      throw new Error("Failed to fetch categories")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await fetch(`${API_URL}/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch category with ID ${id}`)
  }

  return response.json()
}

export async function createCategory(name: string): Promise<Category> {
  const response = await fetch(`${API_URL}?name=${encodeURIComponent(name)}`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to create category")
  }

  return response.json()
}

export async function updateCategory(category: Category): Promise<Category> {
  const response = await fetch(`${API_URL}/api/updatecategory`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  })

  if (!response.ok) {
    throw new Error(`Failed to update category with ID ${category.id}`)
  }

  return response.json()
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(API_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete category with ID ${id}`)
  }
}
