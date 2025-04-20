// Mock data for development when backend is not available

export const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@example.com" },
  { id: 2, name: "Test User", email: "test@example.com" },
]

export const mockCategories = [
  { id: "cat1", name: "Reports" },
  { id: "cat2", name: "Presentations" },
  { id: "cat3", name: "Contracts" },
  { id: "cat4", name: "Policies" },
]

export const mockDocuments = [
  {
    id: 1,
    title: "Annual Report 2023",
    description: "Company annual financial report",
    fileType: "application/pdf",
    fileUrl: "/placeholder.svg?height=300&width=200",
    datePosted: "2023-12-15",
    category: mockCategories[0],
  },
  {
    id: 2,
    title: "Q1 Presentation",
    description: "First quarter results presentation",
    fileType: "application/vnd.ms-powerpoint",
    fileUrl: "/placeholder.svg?height=300&width=200",
    datePosted: "2024-01-20",
    category: mockCategories[1],
  },
  {
    id: 3,
    title: "Vendor Agreement",
    description: "Standard vendor contract template",
    fileType: "application/pdf",
    fileUrl: "/placeholder.svg?height=300&width=200",
    datePosted: "2024-02-05",
    category: mockCategories[2],
  },
]

export const mockNews = [
  {
    id: 1,
    title: "Company Expansion Announced",
    description: "We are excited to announce our expansion into new markets...",
    datePosted: "2024-03-01",
  },
  {
    id: 2,
    title: "New Product Launch",
    description: "Introducing our latest product innovation...",
    datePosted: "2024-02-15",
  },
  {
    id: 3,
    title: "Annual Conference Dates",
    description: "Save the date for our annual industry conference...",
    datePosted: "2024-01-10",
  },
]
