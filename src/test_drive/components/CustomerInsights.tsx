import './CustomerInsights.css';

interface InsightItem {
  icon: string;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  description: string;
}

interface CustomerInsightsProps {
  headless?: boolean;
}

export function CustomerInsights({ headless = false }: CustomerInsightsProps) {
  const insights: InsightItem[] = [
    {
      icon: '👥',
      title: 'Primary Demographic',
      value: '26-45 Male',
      trend: 'neutral',
      description: '67% of test drive customers'
    },
    {
      icon: '🚗',
      title: 'Most Popular Model',
      value: 'RX350',
      trend: 'up',
      description: 'SUVs dominate with 72% share'
    },
    {
      icon: '🌐',
      title: 'Top Channel',
      value: 'Website',
      trend: 'up',
      description: '37% of all leads (Organic + Paid)'
    },
    {
      icon: '📍',
      title: 'Best Showroom',
      value: 'DFC Dubai',
      trend: 'up',
      description: '23% of all test drives'
    }
  ];

  return (
    <div className={`customer-insights ${headless ? 'headless' : ''}`}>
      <div className="insights-header">
        <h3 className="insights-title">Key Insights</h3>
      </div>
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className="insight-item">
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
              <div className="insight-label">{insight.title}</div>
              <div className="insight-value">
                {insight.value}
                {insight.trend === 'up' && <span className="trend-up">↑</span>}
                {insight.trend === 'down' && <span className="trend-down">↓</span>}
              </div>
              <div className="insight-description">{insight.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerInsights;
