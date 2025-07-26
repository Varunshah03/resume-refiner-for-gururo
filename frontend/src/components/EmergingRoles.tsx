import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp } from 'lucide-react';

interface EmergingRole {
  title: string;
  growth: number;
  match: number;
}

interface EmergingRolesProps {
  data: EmergingRole[];
}

export const EmergingRoles = ({ data }: EmergingRolesProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <div className="flex items-center mb-6">
        <Sparkles className="w-5 h-5 text-accent mr-2" />
        <h2 className="text-xl font-semibold text-foreground">Emerging Career Paths</h2>
      </div>
      
      <div className="space-y-6">
        {data.map((role, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{role.title}</h3>
              <Badge 
                variant="outline" 
                className="border-accent/30 text-accent"
              >
                {role.match}% Match
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Growth Potential
                </span>
                <span className="text-foreground font-medium">{role.growth}%</span>
              </div>
              <Progress 
                value={role.growth} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Skill Match</span>
                <span className="text-foreground font-medium">{role.match}%</span>
              </div>
              <Progress 
                value={role.match} 
                className="h-2"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};