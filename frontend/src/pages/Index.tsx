import { useState } from 'react';
import { UploadSection } from '@/components/UploadSection';
import { AnalysisResults } from '@/components/AnalysisResults';
import { analyzeResume } from '@/utils/mockData'; // Removed generateMockAnalysis import
import { Brain, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    console.log('handleFileUpload called with file:', file.name);
    setIsLoading(true);

    try {
      const aiAnalysis = await analyzeResume(file);
      console.log('Received AI analysis:', aiAnalysis);
      setAnalysisData(aiAnalysis);
      toast({
        title: 'Analysis Complete',
        description: 'Your resume has been analyzed successfully using AI.',
      });
    } catch (error) {
      console.error('handleFileUpload error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
      throw error; // Prevent fallback to mock data for debugging
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setAnalysisData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-radial flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Analyzing Your Resume</h2>
            <p className="text-muted-foreground">Our AI is processing your career data...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (analysisData) {
    return (
      <div className="min-h-screen bg-background bg-gradient-radial py-12 px-4">
        <AnalysisResults data={analysisData} onAnalyzeAnother={handleAnalyzeAnother} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-radial">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">AI-Powered Career Analysis</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Career<span className="bg-gradient-primary bg-clip-text text-transparent">Scope</span>
                <span className="text-accent"> AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Get deep insights into your career trajectory with AI-powered resume analysis,
                future-proof skill recommendations, and personalized growth strategies.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">AI Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced AI algorithms analyze your skills and experience
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">10-Year Forecast</h3>
                <p className="text-muted-foreground text-sm">
                  Detailed career growth and salary projections
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Future-Proof</h3>
                <p className="text-muted-foreground text-sm">
                  Stay ahead of AI disruption with strategic recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <UploadSection onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
};

export default Index;