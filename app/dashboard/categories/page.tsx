"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoriesTable } from "@/components/categories-table"
import { CategoryDialog } from "@/components/category-dialog"
import { getAllCategories } from "@/lib/api/categories"

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#004c98]">Categories</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#004c98] hover:bg-[#003a75]">
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Create, view, update, and delete document categories</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesTable categories={categories} />
        </CardContent>
      </Card>

      <CategoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
