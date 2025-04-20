"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DocumentsTable } from "@/components/documents-table"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { Pagination } from "@/components/ui/pagination"
import { getAllCategories } from "@/lib/api/categories"
import { getAllDocuments, getDocumentsByCategory } from "@/lib/api/documents"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"

const ITEMS_PER_PAGE = 5
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

export default function DocumentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: STALE_TIME,
  })

  const { 
    data: documents = [], 
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
    isRefetching 
  } = useQuery({
    queryKey: ["documents", selectedCategory],
    queryFn: () => selectedCategory ? getDocumentsByCategory(selectedCategory) : getAllDocuments(),
    staleTime: STALE_TIME,
    retry: 2,
    retryDelay: 1000,
  })

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!documents.length) return []
    
    return documents.filter((doc) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(searchLower) ||
        doc.category.name.toLowerCase().includes(searchLower) ||
        doc.fileType.toLowerCase().includes(searchLower)
      )
    })
  }, [documents, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoadingCategories || isLoadingDocuments) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#004c98]">Documents</h1>
          <Button disabled className="bg-[#004c98] hover:bg-[#003a75]">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Loading documents...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004c98]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (documentsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#004c98]">Documents</h1>
          <Button 
            onClick={() => refetchDocuments()} 
            className="bg-[#004c98] hover:bg-[#003a75]"
            disabled={isRefetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Failed to load documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load documents. Please try again later.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#004c98]">Documents</h1>
        <Button 
          onClick={() => setIsUploadDialogOpen(true)} 
          className="bg-[#004c98] hover:bg-[#003a75]"
          disabled={isRefetching}
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            {isRefetching ? 'Refreshing documents...' : 'View, upload, update, and delete documents'}
          </CardDescription>
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
                  setCurrentPage(1)
                }}
                className="pl-8"
                disabled={isRefetching}
              />
            </div>
          </div>
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(value) => {
              setSelectedCategory(value === "all" ? null : value)
              setCurrentPage(1)
            }}
          >
            <div className="relative">
              <div className="absolute right-0 top-0 h-10 w-8 bg-gradient-to-l from-background to-transparent" />
              <div className="absolute left-0 top-0 h-10 w-8 bg-gradient-to-r from-background to-transparent" />
              <div className="overflow-auto scrollbar-hide">
                <TabsList className="mb-4 inline-flex w-max border-b px-8">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-none border-b-2 border-transparent px-4 py-2 hover:text-foreground data-[state=active]:border-[#004c98] data-[state=active]:text-[#004c98]"
                    disabled={isRefetching}
                  >
                    All Documents
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="rounded-none border-b-2 border-transparent px-4 py-2 hover:text-foreground data-[state=active]:border-[#004c98] data-[state=active]:text-[#004c98]"
                      disabled={isRefetching}
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            <TabsContent value="all">
              <DocumentsTable 
                documents={paginatedDocuments} 
                categories={categories} 
                isLoading={isRefetching}
              />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  disabled={isRefetching}
                />
              )}
            </TabsContent>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <DocumentsTable 
                  documents={paginatedDocuments} 
                  categories={categories} 
                  isLoading={isRefetching}
                />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    disabled={isRefetching}
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
