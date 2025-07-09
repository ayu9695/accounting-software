
import React, { useState } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload } from "lucide-react";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, name: string) => void;
  title: string;
  description?: string;
  fileTypes?: string;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onOpenChange,
  onUpload,
  title,
  description,
  fileTypes = "application/pdf,image/*",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    onUpload(file, fileName || file.name);
    onOpenChange(false);
    
    toast.success(`${fileName || file.name} has been uploaded successfully.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <PopupForm
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fileName">File Name (Optional)</Label>
          <Input
            id="fileName"
            placeholder="Enter a custom file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fileUpload">File</Label>
          <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              id="fileUpload"
              type="file"
              accept={fileTypes}
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium mb-1">
                {file ? file.name : "Click to upload or drag and drop"}
              </span>
              <span className="text-xs text-muted-foreground">
                {fileTypes.includes("image") ? "PDF, PNG, JPG up to 10MB" : "PDF files up to 10MB"}
              </span>
            </label>
          </div>
        </div>
        
        {file && (
          <div className="text-sm text-muted-foreground">
            Selected file: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>
    </PopupForm>
  );
};
