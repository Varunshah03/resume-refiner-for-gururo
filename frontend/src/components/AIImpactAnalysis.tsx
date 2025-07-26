import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Clock, Target } from 'lucide-react';

interface AIImpactData {
  summary: string;
  timeline: string;
  adaptationPotential: number;
}

interface AIImpactAnalysisProps {
  data: AIImpactData;
}

export const AIImpactAnalysis = ({ data }: AIImpactAnalysisProps) => {
  const getAdaptationColor = (potential: number) => {
    if (potential >= 80) return 'text-green-500';
    if (potential >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <div className="flex items-center mb-6">
        <Bot className="w-5 h-5 text-primary mr-2" />
        <h2 className="text-xl font-semibold text-foreground">AI Impact Analysis</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Impact Summary</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {data.summary}
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Timeline</h3>
          </div>
          <Badge 
            variant="outline" 
            className="border-primary/30 text-primary"
          >
            {data.timeline}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Adaptation Potential</h3>
            </div>
            <span className={`font-semibold ${getAdaptationColor(data.adaptationPotential)}`}>
              {data.adaptationPotential}%
            </span>
          </div>
          <Progress 
            value={data.adaptationPotential} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground">
            Your ability to adapt to AI-driven changes in your field
          </p>
        </div>
      </div>
    </Card>
  );
};