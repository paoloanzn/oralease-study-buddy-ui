import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ENDPOINTS } from "@/config/endpoints";
import { Upload, FileText, X } from "lucide-react";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNoteModal = ({ isOpen, onClose }: CreateNoteModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your notes.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Convert files to base64
      const filePromises = files.map(async (file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = () => {
            resolve({
              content: reader.result as string,
              filename: file.name,
              mime_type: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const processedFiles = await Promise.all(filePromises);

      // Call the media processing endpoint
      const response = await fetch(ENDPOINTS.PROCESS_MEDIA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: processedFiles,
          title: title.trim(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process media files');
      }

      const result = await response.json();

      if (result.status === 'error') {
        throw new Error(result.error || 'Failed to process media files');
      }

      toast({
        title: "Notes Created Successfully!",
        description: "Your notes have been processed and are ready for use.",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Notes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Files</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload files</span>
                <span className="text-xs text-gray-500">PDF, Images (JPG, PNG), Text files</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || files.length === 0 || isProcessing}
          >
            {isProcessing ? "Processing..." : "Create Notes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
