"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NewsTable } from "@/components/news-table"
import { NewsDialog } from "@/components/news-dialog"
import { Pagination } from "@/components/ui/pagination"
import { getAllNews } from "@/lib/api/news"

const ITEMS_PER_PAGE = 5

export default function NewsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: news = [] } = useQuery({
    queryKey: ["news"],
    queryFn: getAllNews,
  })

  // Filter news based on search query
  const filteredNews = news.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#004c98]">News</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#004c98] hover:bg-[#003a75]">
          <Plus className="mr-2 h-4 w-4" />
          Create News
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>News Management</CardTitle>
          <CardDescription>Create, view, update, and delete news articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-8"
              />
            </div>
          </div>
          <NewsTable news={paginatedNews} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      <NewsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
