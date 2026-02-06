'use client';

interface Stat {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
}

interface StatsBarProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  { label: 'Total Skills', value: 142, change: 8 },
  { label: 'Active Agents', value: '12,847', change: 24.2 },
  { label: 'Volume 24H', value: '847.2', unit: 'SOL', change: -3.2 },
  { label: 'Floor Price', value: '0.5', unit: 'SOL', change: 5.1 },
  { label: 'Verified Creators', value: 89, change: 12 },
];

export function StatsBar({ stats = defaultStats }: StatsBarProps) {
  return (
    <div className="flex gap-6 py-5 border-b border-border-default mb-5 flex-wrap">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-[100px]">
          <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">
            {stat.label}
          </div>
          <div className="text-2xl font-bold flex items-baseline gap-2">
            <span>{stat.value}</span>
            {stat.unit && (
              <span className="text-sm text-text-muted">{stat.unit}</span>
            )}
            {stat.change !== undefined && (
              <span
                className={`text-xs ${
                  stat.change >= 0 ? 'text-accent-secondary' : 'text-accent-danger'
                }`}
              >
                {stat.change >= 0 ? '+' : ''}{stat.change}
                {typeof stat.value === 'string' && stat.value.includes(',') ? '%' : ''}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
