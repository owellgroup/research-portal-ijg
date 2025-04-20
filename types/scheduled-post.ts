export interface ScheduledPost {
  id: number;
  type: 'news' | 'document';
  title: string;
  description: string;
  scheduledDate: string;
  status: 'scheduled' | 'published' | 'draft';
  content?: string;  // Optional for documents
  fileUrl?: string;  // For documents
  imageUrl?: string;
  author?: string;
  category?: string;
} 