import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CareerGrowthChart } from './CareerGrowthChart';
import { SkillsRadarChart } from './SkillsRadarChart';
import { EmergingRoles } from './EmergingRoles';
import { AIImpactAnalysis } from './AIImpactAnalysis';
import { Recommendations } from './Recommendations';
import { TrendingUp, Shield, Brain, RotateCcw } from 'lucide-react';

interface AnalysisData {
  jobTitle: string;
  experienceLevel: string;
  aiRiskLevel: 'Low' | 'Medium' | 'High';
  coreSkills: string[];
  careerGrowth: Array<{ year: number; demand: number; salary: number }>;
  skillsAssessment: Array<{ skill: string; current: number; recommended: number }>;
  emergingRoles: Array<{ title: string; growth: number; match: number }>;
  aiImpact: {
    summary: string;
    timeline: string;
    adaptationPotential: number;
  };
  recommendations: string[];
}

interface AnalysisResultsProps {
  data: AnalysisData;
  onAnalyzeAnother: () => void;
}

export const AnalysisResults = ({ data, onAnalyzeAnother }: AnalysisResultsProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-success/10 text-success border-success/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{data.jobTitle}</h1>
              <p className="text-xl text-muted-foreground">{data.experienceLevel}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getRiskColor(data.aiRiskLevel)} border`}>
                <Shield className="w-4 h-4 mr-2" />
                AI Risk: {data.aiRiskLevel}
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis Complete
              </Badge>
            </div>
          </div>
          <Button
            onClick={onAnalyzeAnother}
            variant="outline"
            className="border-primary/30 hover:border-primary text-primary hover:bg-primary/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Analyze Another Resume
          </Button>
        </div>
      </Card>
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-4">Core Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.coreSkills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-foreground">Career Growth Projection</h2>
          </div>
          <CareerGrowthChart data={data.careerGrowth} jobTitle={data.jobTitle} />
        </Card>
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Skills Assessment</h2>
          <SkillsRadarChart data={data.skillsAssessment} />
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EmergingRoles data={data.emergingRoles} />
        <AIImpactAnalysis data={data.aiImpact} />
      </div>
      <Recommendations recommendations={data.recommendations} />
    </div>
  );
};