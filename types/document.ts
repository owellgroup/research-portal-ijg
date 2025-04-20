import type { Category } from "./category"

export interface Document {
  id: number
  title: string
  description: string
  fileType: string
  fileUrl: string
  datePosted: string
  category: Category
}
