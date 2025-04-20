"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DocumentsTable } from "@/components/documents-table"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { Pagination } from "@/components/ui/pagination"
import { getAllCategories } from "@/lib/api/categories"
import { getAllDocuments, getDocumentsByCategory } from "@/lib/api/documents"

const ITEMS_PER_PAGE = 5

export default function DocumentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ["documents", selectedCategory],
    queryFn: () => selectedCategory ? getDocumentsByCategory(selectedCategory) : getAllDocuments(),
  })

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.category.name.toLowerCase().includes(searchLower) ||
      doc.fileType.toLowerCase().includes(searchLower)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#004c98]">Documents</h1>
        <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-[#004c98] hover:bg-[#003a75]">
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>View, upload, update, and delete documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-8"
              />
            </div>
          </div>
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(value) => {
              setSelectedCategory(value === "all" ? null : value)
              setCurrentPage(1) // Reset to first page when changing category
            }}
          >
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              <DocumentsTable documents={paginatedDocuments} categories={categories} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </TabsContent>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <DocumentsTable documents={paginatedDocuments} categories={categories} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <DocumentUploadDialog 
        open={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen} 
        categories={categories}
      />
    </div>
  )
}
