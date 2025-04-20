import { API_BASE_URL } from '@/lib/config';
import type { ScheduledPost } from '@/types/scheduled-post';

export async function getAllScheduledPosts(): Promise<ScheduledPost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scheduled-posts`);
    if (!response.ok) throw new Error('Failed to fetch scheduled posts');
    return response.json();
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return [];
  }
}

export async function createScheduledPost(data: FormData): Promise<ScheduledPost> {
  const response = await fetch(`${API_BASE_URL}/api/scheduled-posts`, {
    method: 'POST',
    body: data,
  });

  if (!response.ok) {
    throw new Error('Failed to create scheduled post');
  }

  return response.json();
}

export async function updateScheduledPost(id: number, data: FormData): Promise<ScheduledPost> {
  const response = await fetch(`${API_BASE_URL}/api/scheduled-posts/${id}`, {
    method: 'PUT',
    body: data,
  });

  if (!response.ok) {
    throw new Error('Failed to update scheduled post');
  }

  return response.json();
}

export async function deleteScheduledPost(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/scheduled-posts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete scheduled post');
  }
} 