import type { Document } from "@/types/document"
import { API_BASE_URL } from '@/lib/config';

const API_URL = "https://ijgapis.onrender.com/api/documents"

export interface DocumentUpdateRequest {
  title: string;
  description: string;
  categoryId?: string;
  file?: File;
}

export async function getAllDocuments(): Promise<Document[]> {
  try {
    const response = await fetch("/api/documents")

    if (!response.ok) {
      throw new Error("Failed to fetch documents")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching all documents:", error)
    return []
  }
}

export async function getDocumentsByCategory(categoryId: string): Promise<Document[]> {
  const response = await fetch(`${API_URL}/category/${categoryId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch documents for category ${categoryId}`)
  }

  return response.json()
}

export async function getDocumentById(id: number): Promise<Document> {
  const response = await fetch(`${API_URL}/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch document with ID ${id}`)
  }

  return response.json()
}

export async function uploadDocument(formData: FormData): Promise<Document> {
  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload document")
  }

  return response.json()
}

export async function updateDocument(id: number, formData: FormData): Promise<Document> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/documents/update/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to update document";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, try to get text
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const updatedDocument = await response.json();
    return updatedDocument;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error instanceof Error ? error : new Error("An unexpected error occurred");
  }
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete document with ID ${id}`)
  }
}

export function getDocumentViewUrl(fileName: string): string {
  return `${API_URL}/view/${fileName}`
}

export function getDocumentDownloadUrl(id: number): string {
  return `${API_URL}/download/${id}`
}

export async function downloadDocument(id: number, fileName: string): Promise<void> {
  try {
    // Get the document details first to get the correct file type
    const doc = await getDocumentById(id);
    
    const response = await fetch(`${API_URL}/download/${id}`, {
      method: 'GET',
      headers: {
        'Accept': doc.fileType || 'application/octet-stream',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Add file extension based on file type if not present in fileName
    let downloadFileName = fileName;
    const fileExtension = doc.fileType.split('/')[1];
    if (fileExtension && !fileName.toLowerCase().endsWith(`.${fileExtension}`)) {
      downloadFileName = `${fileName}.${fileExtension}`;
    }
    
    a.href = url;
    a.download = downloadFileName;
    
    // Use a try-finally to ensure cleanup
    try {
      document.body.appendChild(a);
      a.click();
    } finally {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}

interface ViewDocumentOptions {
  retryAttempts?: number;
  timeout?: number;
}

export async function viewDocument(
  fileName: string,
  options: ViewDocumentOptions = {}
): Promise<{ url: string; type: string }> {
  const { retryAttempts = 3, timeout = 10000 } = options;
  const encodedFileName = encodeURIComponent(fileName);

  // Define all possible endpoints to try
  const endpoints = [
    // Try local Next.js API route first
    `/api/documents/view/${encodedFileName}`,
    // Then try direct backend URL
    `${API_BASE_URL}/api/documents/view/${encodedFileName}`,
    // Then try direct download URL
    `${API_BASE_URL}/api/documents/download/${encodedFileName}`,
    // Then try storage URL if available
    `/storage/documents/${encodedFileName}`,
    // Finally try the original URL if it's absolute
    fileName.startsWith('http') ? fileName : null
  ].filter(Boolean);

  let lastError: Error | null = null;

  // Try each endpoint
  for (const endpoint of endpoints) {
    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        console.log(`Attempting to fetch document from ${endpoint} (attempt ${attempt + 1})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        if (!endpoint) {
          throw new Error("Invalid endpoint: null or undefined");
        }

        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/pdf',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          signal: controller.signal,
          cache: 'no-cache',
          credentials: 'include'
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const blob = await response.blob();
          const contentType = response.headers.get('content-type') || 'application/pdf';
          const contentDisposition = response.headers.get('content-disposition');
          
          // Check if the response is meant to be downloaded
          if (contentDisposition && contentDisposition.includes('attachment')) {
            throw new Error('Document is configured for download only');
          }
          
          // Create a URL that can be used for viewing
          const url = URL.createObjectURL(blob);
          console.log(`Successfully loaded document from ${endpoint}, Content-Type: ${contentType}`);
          
          return {
            url,
            type: contentType
          };
        } else {
          throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint} (attempt ${attempt + 1}):`, error);
        lastError = error as Error;
      }
    }
  }

  // If we have a direct URL to the file, try to return it as a last resort
  if (fileName.startsWith('http')) {
    console.log('Falling back to direct URL:', fileName);
    return {
      url: fileName,
      type: 'application/pdf'
    };
  }

  throw new Error(
    `Failed to load document from all available sources. Last error: ${lastError?.message}`
  );
}
