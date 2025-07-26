import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CareerGrowthData {
  year: number;
  demand: number;
  salary: number;
}

interface CareerGrowthChartProps {
  data: CareerGrowthData[];
  jobTitle: string;
}

const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  'Software Engineer': { min: 80000, max: 200000 },
  'Senior Software Engineer': { min: 100000, max: 250000 },
  'Data Scientist': { min: 100000, max: 220000 },
  'Product Manager': { min: 90000, max: 180000 },
  'UX Designer': { min: 70000, max: 150000 },
  'DevOps Engineer': { min: 95000, max: 200000 },
  'Marketing Manager': { min: 80000, max: 160000 },
  'default': { min: 60000, max: 150000 },
};

// STRICT demand ranges - these should NEVER be exceeded
const DEMAND_RANGES: Record<string, { min: number; max: number }> = {
  'Senior Software Engineer': { min: 70, max: 85 },
  'Data Scientist': { min: 75, max: 90 },
  'Product Manager': { min: 60, max: 80 },
  'UX Designer': { min: 50, max: 70 },
  'DevOps Engineer': { min: 65, max: 85 },
  'Marketing Manager': { min: 45, max: 65 },
  'default': { min: 40, max: 60 },
};

// Helper function to normalize job title for consistent range lookup
function normalizeJobTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('senior') && (titleLower.includes('software') || titleLower.includes('engineer'))) {
    return 'Senior Software Engineer';
  }
  if (titleLower.includes('data') && titleLower.includes('scientist')) {
    return 'Data Scientist';
  }
  if (titleLower.includes('product') && titleLower.includes('manager')) {
    return 'Product Manager';
  }
  if (titleLower.includes('ux') || titleLower.includes('ui')) {
    return 'UX Designer';
  }
  if (titleLower.includes('devops')) {
    return 'DevOps Engineer';  
  }
  if (titleLower.includes('marketing') && titleLower.includes('manager')) {
    return 'Marketing Manager';
  }
  
  return 'default';
}

export const CareerGrowthChart = ({ data, jobTitle }: CareerGrowthChartProps) => {
  console.log(`CareerGrowthChart data for ${jobTitle}:`, data);

  // Normalize job title for consistent range lookup
  const normalizedJobTitle = normalizeJobTitle(jobTitle);
  const demandRange = DEMAND_RANGES[normalizedJobTitle] || DEMAND_RANGES['default'];
  const salaryRange = SALARY_RANGES[normalizedJobTitle] || SALARY_RANGES['default'];

  console.log(`Job title: ${jobTitle} -> Normalized: ${normalizedJobTitle}`);
  console.log(`Demand range for chart: ${demandRange.min}% - ${demandRange.max}%`);

  // Strict validation and normalization of data
  const normalizedData = data.map((item, index) => {
    let demand = Math.round(item.demand);
    let salary = item.salary < 1000 ? item.salary * 1000 : Math.round(item.salary);

    // Strictly enforce demand limits with warnings
    if (demand > demandRange.max) {
      console.info(`Chart: Adjusting demand for year ${item.year} from ${demand}% to ${demandRange.max}% (max for ${normalizedJobTitle})`);
      demand = demandRange.max;
    } else if (demand < demandRange.min) {
      console.info(`Chart: Adjusting demand for year ${item.year} from ${demand}% to ${demandRange.min}% (min for ${normalizedJobTitle})`);
      demand = demandRange.min;
    }

    // Enforce salary limits
    if (salary > salaryRange.max) {
      salary = salaryRange.max;
    } else if (salary < salaryRange.min) {
      salary = salaryRange.min;
    }

    return {
      ...item,
      demand,
      salary,
    };
  });

  console.log(`Normalized chart data for ${jobTitle}:`, normalizedData);
  console.log(`Final demand values:`, normalizedData.map(item => `${item.year}: ${item.demand}%`));
  
  // Final verification - log any values that still exceed limits
  const maxDemand = Math.max(...normalizedData.map(item => item.demand));
  if (maxDemand > demandRange.max) {
    console.error(`ERROR: Chart still showing demand ${maxDemand}% above maximum ${demandRange.max}% for ${jobTitle}`);
  }

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDemand = (value: number) => `${value}%`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{`Year ${label}`}</p>
          <p className="text-primary">{`Market Demand: ${payload[0].value}%`}</p>
          <p className="text-accent">{`Average Salary: ${formatSalary(payload[1].value)}`}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Range: {demandRange.min}%-{demandRange.max}% demand
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <div className="mb-2 text-sm text-muted-foreground">
        Market Demand Range for {jobTitle}: {demandRange.min}% - {demandRange.max}%
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={normalizedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="year"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            yAxisId="demand"
            orientation="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatDemand}
            domain={[demandRange.min - 2, demandRange.max + 2]}
            tickCount={6}
          />
          <YAxis
            yAxisId="salary"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatSalary}
            domain={[salaryRange.min * 0.9, salaryRange.max * 1.1]}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="demand"
            type="monotone"
            dataKey="demand"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            name="Market Demand (%)"
          />
          <Line
            yAxisId="salary"
            type="monotone"
            dataKey="salary"
            stroke="hsl(var(--accent))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
            name="Average Salary"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};