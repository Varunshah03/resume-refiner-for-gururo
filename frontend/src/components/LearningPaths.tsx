import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink } from 'lucide-react';

interface LearningPath {
  title: string;
  platform: string;
  duration: string;
  link: string;
  skillAddressed: string;
}

interface LearningPathsProps {
  learningPaths: LearningPath[];
}

export const LearningPaths = ({ learningPaths }: LearningPathsProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <h2 className="text-xl font-semibold text-foreground mb-4">Recommended Learning Paths</h2>
      {learningPaths.length === 0 ? (
        <p className="text-muted-foreground">No learning paths available at this time.</p>
      ) : (
        <div className="space-y-4">
          {learningPaths.map((path, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-primary/5 rounded-lg border border-primary/20"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-foreground">{path.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Platform: {path.platform} | Duration: {path.duration}
                </p>
                <div className="text-sm text-muted-foreground">
                  Addresses: <Badge className="bg-primary/10 text-primary">{path.skillAddressed}</Badge>
                </div>
              </div>
              {/* <a
                href={path.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 md:mt-0 text-primary hover:underline flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Enroll Now
              </a> */}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};