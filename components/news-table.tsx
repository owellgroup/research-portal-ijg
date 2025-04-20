"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
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
import { NewsDialog } from "@/components/news-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import { deleteNews } from "@/lib/api/news"
import type { News } from "@/types/news"

interface NewsTableProps {
  news: News[]
}

export function NewsTable({ news }: NewsTableProps) {
  const [editNews, setEditNews] = useState<News | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!newsToDelete) return

    try {
      await deleteNews(newsToDelete.id)
      queryClient.invalidateQueries({ queryKey: ["news"] })
      toast({
        title: "News deleted",
        description: "The news article has been deleted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete news article. Please try again.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setNewsToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No news articles found.
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{format(new Date(item.datePosted), "MMM d, yyyy")}</TableCell>
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
                        <DropdownMenuItem onClick={() => setEditNews(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setNewsToDelete(item)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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

      {editNews && <NewsDialog news={editNews} open={!!editNews} onOpenChange={(open) => !open && setEditNews(null)} />}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete News"
        description="Are you sure you want to delete this news article? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  )
}
