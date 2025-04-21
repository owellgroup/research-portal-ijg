"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { uploadDocument, updateDocument } from "@/lib/api/documents"
import { getAllCategories } from "@/lib/api/categories"
import type { Category } from "@/types/category"
import type { Document } from "@/types/document"

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: Document // The document to edit
}

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  document 
}: DocumentUploadDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  })

  // Reset form when dialog opens/closes or document changes
  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setDescription(document.description || "")
      setCategoryId(document.category.id)
      setPreviewUrl(document.fileUrl)
    } else {
      setTitle("")
      setDescription("")
      setCategoryId("")
      setFile(null)
      setPreviewUrl("")
    }
  }, [document, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("categoryId", categoryId)
      
      if (file) {
        formData.append("file", file)
      }

      if (document) {
        // Update existing document
        await updateDocument(document.id, formData)
        toast({
          title: "Document updated",
          description: "The document has been updated successfully.",
        })
      } else {
        // Create new document
        await uploadDocument(formData)
        toast({
          title: "Document uploaded",
          description: "The document has been uploaded successfully.",
        })
      }

      // Invalidate and refetch the documents query
      await queryClient.invalidateQueries({ queryKey: ["documents"] })
      await queryClient.refetchQueries({ queryKey: ["documents"] })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting document:", error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Create preview URL for the file if it's an image
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {document ? "Edit Document" : "Upload Document"}
          </DialogTitle>
          <DialogDescription>
            {document 
              ? "Update the document details below" 
              : "Fill in the details and upload your document"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">
              {document ? "Replace File (optional)" : "File"}
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,image/*"
              required={!document}
            />
            {previewUrl && (
              <div className="mt-2">
                {previewUrl.toLowerCase().endsWith('.pdf') ? (
                  <p className="text-sm text-muted-foreground">
                    Current file: PDF Document
                  </p>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-32 object-contain"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {document ? "Updating..." : "Uploading..."}
                </>
              ) : (
                document ? "Update Document" : "Upload Document"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
