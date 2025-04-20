"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Download, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import { deleteDocument } from "@/lib/api/documents"
import type { Document } from "@/types/document"
import type { Category } from "@/types/category"

interface DocumentsTableProps {
  documents: Document[]
  categories: Category[]
}

export function DocumentsTable({ documents, categories }: DocumentsTableProps) {
  const [editDocument, setEditDocument] = useState<Document | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      await deleteDocument(documentToDelete.id)
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document. Please try again.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>{document.category.name}</TableCell>
                  <TableCell>{format(new Date(document.datePosted), "MMM d, yyyy")}</TableCell>
                  <TableCell>{document.fileType}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditDocument(document)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDocumentToDelete(document)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a
                            href={document.fileUrl}
                            download
                            onClick={(e) => {
                              e.preventDefault()
                              window.open(document.fileUrl, '_blank')
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editDocument && (
        <DocumentUploadDialog
          document={editDocument}
          categories={categories}
          open={!!editDocument}
          onOpenChange={(open) => !open && setEditDocument(null)}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  )
}
