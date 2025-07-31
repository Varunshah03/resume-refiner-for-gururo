import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase.js";
import { Link } from "react-router-dom";

interface UploadSectionProps {
  onFileUpload: (file: File) => Promise<void>;
}

export default function UploadSection({ onFileUpload }: UploadSectionProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        setFile(droppedFile);
      }
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a resume file to analyze.",
        variant: "destructive",
      });
      return;
    }

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onFileUpload(file);
      toast({
        title: "Success",
        description: "Resume analysis completed successfully.",
      });
      setFile(null);
    } catch (error: any) {
      console.error("Analyze error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const user = auth.currentUser;
  const displayName = user?.displayName || "User";
  const email = user?.email || "No email";

  return (
    <div className="relative max-w-2xl mx-auto p-6">
      {/* Profile Link - Fixed Top-Right */}
      <Link to="/profile" className="fixed top-4 right-4 group z-50">
        <div className="flex items-center gap-3 bg-gradient-card p-3 rounded-full shadow-card hover:shadow-glow/20 transition-smooth">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-primary text-white text-sm font-bold">
            {getInitials(displayName)}
          </div>
          <div className="hidden group-hover:block text-sm max-w-xs truncate">
            <p className="font-medium">{displayName}</p>
            <p className="text-muted-foreground">{email}</p>
          </div>
        </div>
      </Link>

      <Card className="bg-gradient-card border-border/50 shadow-card transition-smooth hover:shadow-glow/20">
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm">
                  {file ? file.name : "Drag and drop your resume here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF and DOCX files (max 10MB)
                </p>
              </div>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <span className="text-sm truncate max-w-[70%]">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            className="w-full"
            variant="gradient"
            onClick={handleAnalyze}
            disabled={isLoading || !file}
          >
            {isLoading ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}