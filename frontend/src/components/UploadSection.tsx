import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UploadSectionProps {
  onFileUpload: (file: File) => Promise<void>;
}

export const UploadSection = ({ onFileUpload }: UploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF or DOCX file.',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const checkAnalysisLimit = async (userEmail: string) => {
    try {
      const attemptRef = doc(db, 'analysisAttempts', userEmail);
      const attemptSnap = await getDoc(attemptRef);

      if (attemptSnap.exists()) {
        const lastAttempt = attemptSnap.data()?.timestamp?.toDate();
        if (lastAttempt) {
          const now = new Date();
          const timeDiff = now.getTime() - lastAttempt.getTime();
          const hoursSinceLastAttempt = timeDiff / (1000 * 60 * 60);

          if (hoursSinceLastAttempt < 24) {
            const hoursLeft = (24 - hoursSinceLastAttempt).toFixed(1);
            toast({
              title: 'Analysis Limit Reached',
              description: `You can only analyze one resume per day. Please try again in ${hoursLeft} hours.`,
              variant: 'destructive',
            });
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking analysis limit:', error);
      toast({
        title: 'Database Error',
        description: 'Failed to check analysis limit. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const recordAnalysisAttempt = async (userEmail: string) => {
    try {
      const attemptRef = doc(db, 'analysisAttempts', userEmail);
      await setDoc(attemptRef, {
        timestamp: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error recording analysis attempt:', error);
      toast({
        title: 'Database Error',
        description: 'Failed to record analysis attempt. Analysis completed, but limit may not be enforced.',
        variant: 'destructive',
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to analyze a resume.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Temporarily disable daily limit check to pause the feature
      // const canAnalyze = await checkAnalysisLimit(user.email);
      // if (!canAnalyze) return;

      console.log('handleAnalyze called with file:', selectedFile.name);
      await onFileUpload(selectedFile);
      // await recordAnalysisAttempt(user.email); // Optionally disable recording as well
      toast({
        title: 'Analysis Complete',
        description: 'Your resume has been successfully analyzed.',
      });
      setSelectedFile(null); // Reset after successful upload
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card transition-smooth hover:shadow-glow/20">
        {!selectedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-smooth ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
            />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Upload Your Resume
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your resume here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF and DOCX files up to 10MB
                </p>
              </div>
              <Button
                type="button"
                variant="gradient"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleAnalyze}
                variant="gradient"
                className="flex-1"
              >
                Analyze Resume
              </Button>
              <Button
                variant="outline"
                onClick={removeFile}
                className="border-border hover:border-primary/50"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};