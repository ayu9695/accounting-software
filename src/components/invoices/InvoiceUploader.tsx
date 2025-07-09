
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const InvoiceUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/png'
    );

    if (validFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPEG, or PNG files only",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Files received",
      description: "Please connect to Supabase to enable invoice parsing",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upload Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 text-muted-foreground" size={32} />
          <div className="mb-4 text-muted-foreground">
            <p className="text-lg font-medium">Drag and drop your invoices here</p>
            <p className="text-sm">or</p>
          </div>
          <Button variant="outline" className="relative">
            Browse Files
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Supports: PDF, JPEG, PNG
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceUploader;
