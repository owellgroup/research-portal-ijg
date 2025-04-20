"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect, useCallback } from "react"
import { viewDocument } from "@/lib/api/documents"
import { Loader2, AlertCircle, ExternalLink, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { Document } from "@/types/document"
import { cn } from "@/lib/utils"

interface DocumentViewDialogProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentViewDialog({ document, open, onOpenChange }: DocumentViewDialogProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [zoom, setZoom] = useState(100)
  const { toast } = useToast()

  const isPdf = document.fileType === "application/pdf"

  const loadDocument = useCallback(async () => {
    if (!document.fileUrl) {
      setError('No document URL provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract filename from fileUrl
      const fileName = document.fileUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid file URL');
      }

      console.log('Loading document:', fileName, 'Attempt:', retryCount + 1);

      const { url, type } = await viewDocument(fileName, {
        retryAttempts: 3,
        timeout: 10000
      });

      setViewUrl(url);
      console.log('Document loaded successfully:', type);
    } catch (err) {
      console.error('Error loading document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
      setError(errorMessage);
      
      if (errorMessage.includes('download only')) {
        toast({
          variant: "destructive",
          title: "Document cannot be viewed",
          description: "This document is configured for download only. Please download it to view.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error loading document",
          description: "Please try again or open in a new tab.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [document.fileUrl, retryCount, toast]);

  useEffect(() => {
    if (open) {
      loadDocument();
    }

    return () => {
      if (viewUrl) {
        URL.revokeObjectURL(viewUrl);
        setViewUrl(null);
      }
    };
  }, [open, loadDocument, viewUrl]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadDocument();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
          <DialogDescription>
            {document.description || `Viewing ${document.title}`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 relative min-h-[60vh]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Loading document...</span>
              </div>
            </div>
          )}

          {error ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex justify-center space-x-4">
                {!error.includes('download only') && (
                  <Button 
                    onClick={handleRetry} 
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                <Button 
                  asChild
                  variant="default"
                >
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    {error.includes('download only') ? 'Download Document' : 'Open in New Tab'}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            viewUrl && (
              <div className="w-full h-[60vh] flex flex-col">
                {isPdf ? (
                  <>
                    <div className="flex justify-end space-x-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(prev => Math.min(prev + 25, 200))}
                        disabled={zoom >= 200}
                      >
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Zoom In
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
                        disabled={zoom <= 50}
                      >
                        <ZoomOut className="h-4 w-4 mr-2" />
                        Zoom Out
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <object
                        data={viewUrl}
                        type="application/pdf"
                        className={cn(
                          "w-full h-full",
                          zoom !== 100 && `scale-[${zoom}%] origin-top-left`
                        )}
                        title={document.title}
                      >
                        <div className="text-center p-8">
                          <p className="mb-4">Unable to display PDF directly</p>
                          <Button asChild>
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              Open PDF
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </object>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <p>This file type cannot be previewed directly.</p>
                    <Button 
                      asChild
                      className="mt-4"
                    >
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        Open File
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
