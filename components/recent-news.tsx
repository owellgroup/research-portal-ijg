"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllNews } from "@/lib/api/news"

export function RecentNews() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: getAllNews,
  })

  // Sort news by date in descending order and take the last 3
  const recentNews = [...news]
    .sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime())
    .slice(0, 3)

  if (isLoading) {
    return <div className="text-center py-4">Loading recent news...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentNews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No news found.
              </TableCell>
            </TableRow>
          ) : (
            recentNews.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.category?.name || "Uncategorized"}</TableCell>
                <TableCell>{format(new Date(item.datePosted), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
