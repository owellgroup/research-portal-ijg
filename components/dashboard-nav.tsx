"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Newspaper, PanelLeft, PanelRight, Tag, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "News",
    href: "/dashboard/news",
    icon: Newspaper,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Tag,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div className={cn("relative border-r bg-white transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 rounded-full border shadow-sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
      </Button>
      <div className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
              pathname === item.href ? "bg-[#004c98] text-white" : "text-gray-500 hover:bg-gray-100",
              isCollapsed && "justify-center",
            )}
          >
            <item.icon className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
