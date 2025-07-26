import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface RecommendationsProps {
  recommendations: string[];
}

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <h2 className="text-xl font-semibold text-foreground mb-6">Strategic Recommendations</h2>
      
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div 
            key={index}
            className="flex items-start space-x-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-smooth"
          >
            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground text-sm leading-relaxed">
                {recommendation}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          </div>
        ))}
      </div>
    </Card>
  );
};