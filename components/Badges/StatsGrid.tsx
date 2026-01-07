interface StatItem {
  label: string;
  value: number;
  colorBg: string;
  colorText: string;
}

export default function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
        gap: '8px',
        marginBottom: '20px' 
    }}>
      {stats.map((stat, idx) => (
        <div key={idx} style={{ 
            background: stat.colorBg, 
            color: stat.colorText, 
            padding: '6px 4px', 
            borderRadius: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '20px' 
        }}>
            <span style={{ fontSize: '11px', opacity: 0.85, lineHeight: '1.2' }}>{stat.label}</span>
            <strong style={{ fontSize: '16px', lineHeight: '1.2' }}>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}