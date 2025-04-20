"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createNews, updateNews } from "@/lib/api/news"
import type { News } from "@/types/news"

interface NewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  news?: News
}

export function NewsDialog({ open, onOpenChange, news }: NewsDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (news) {
      setTitle(news.title)
      setDescription(news.description)
    } else {
      setTitle("")
      setDescription("")
    }
  }, [news, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (news) {
        await updateNews(news.id, { title, description })
        toast({
          title: "News updated",
          description: "The news article has been updated successfully.",
        })
      } else {
        await createNews({ title, description })
        toast({
          title: "News created",
          description: "The news article has been created successfully.",
        })
      }

      queryClient.invalidateQueries({ queryKey: ["news"] })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: news
          ? "Failed to update news article. Please try again."
          : "Failed to create news article. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{news ? "Edit News" : "Create News"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#004c98] hover:bg-[#003a75]" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : news ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
