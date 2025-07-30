import { memo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface SkillData {
  skill: string;
  current: number;
  recommended: number;
}

interface SkillsRadarChartProps {
  data: SkillData[];
}

export const SkillsRadarChart = memo(({ data }: SkillsRadarChartProps) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p className="text-muted-foreground">No skills data available to display.</p>;
  }

  const validatedData = data.map(item => ({
    skill: item.skill || 'Unknown',
    current: Math.min(100, Math.max(0, Number(item.current) || 0)),
    recommended: Math.min(100, Math.max(0, Number(item.recommended) || 0)),
  }));

  return (
    <div className="h-80 w-full" role="region" aria-label="Skills assessment radar chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={validatedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={0}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickCount={8}
          />
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Radar
            name="Recommended Level"
            dataKey="recommended"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend 
            wrapperStyle={{
              color: 'hsl(var(--foreground))',
              fontSize: '12px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="sr-only">
        <h3>Skills Assessment</h3>
        <ul>
          {validatedData.map(item => (
            <li key={item.skill}>
              {item.skill}: Current level {item.current}%, Recommended level {item.recommended}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});