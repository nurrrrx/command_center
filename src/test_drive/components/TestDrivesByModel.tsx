import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { timeSeriesByModelData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './TestDrivesByModel.css';

type TimePeriod = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const MODEL_COLORS: Record<string, string> = {
  'RX 350': '#4285f4',
  'LX 600': '#ea4335',
  'NX 350': '#34a853',
  'ES 350': '#fbbc04',
  'GX 460': '#9334e6',
  'IS 350': '#00bcd4',
  'LC 500': '#ff5722',
  'LS 500': '#3f51b5',
  'UX 250h': '#795548',
  'RZ 450e': '#e91e63',
  'TX 350': '#009688',
  'TX 500h': '#673ab7',
  'TX 550h+': '#ff9800'
};

interface ModelPerformance {
  model: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  sparklineData: { date: Date; value: number }[];
  color: string;
}

interface TestDrivesByModelProps {
  filters?: GlobalFilters;
}

export function TestDrivesByModel({ filters: _filters }: TestDrivesByModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1Y');
  const [sortBy, setSortBy] = useState<'model' | 'value' | 'change'>('value');
  const [sortAsc, setSortAsc] = useState(false);

  const modelPerformance = useMemo(() => {
    const parseDate = d3.timeParse('%Y-%m-%d');
    const now = new Date();

    // Calculate start date based on time period
    let startDate: Date;
    switch (timePeriod) {
      case '1M': startDate = d3.timeMonth.offset(now, -1); break;
      case '3M': startDate = d3.timeMonth.offset(now, -3); break;
      case '6M': startDate = d3.timeMonth.offset(now, -6); break;
      case '1Y': startDate = d3.timeYear.offset(now, -1); break;
      default: startDate = new Date(0); // ALL
    }

    // Group data by model
    const dataByModel = d3.group(
      timeSeriesByModelData
        .filter(d => d.model)
        .map(d => ({
          date: parseDate(d.date)!,
          model: d.model!,
          testDrives: d.testDrives
        }))
        .filter(d => d.date >= startDate),
      d => d.model
    );

    const results: ModelPerformance[] = [];

    dataByModel.forEach((values, model) => {
      const sortedValues = values.sort((a, b) => a.date.getTime() - b.date.getTime());

      if (sortedValues.length < 2) return;

      // Aggregate by month for sparkline
      const monthlyData = d3.rollups(
        sortedValues,
        v => d3.sum(v, d => d.testDrives),
        d => d3.timeMonth.floor(d.date)
      ).map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate totals for first and last period
      const midpoint = Math.floor(monthlyData.length / 2);
      const firstHalf = monthlyData.slice(0, midpoint);
      const secondHalf = monthlyData.slice(midpoint);

      const previousValue = d3.sum(firstHalf, d => d.value);
      const currentValue = d3.sum(secondHalf, d => d.value);
      const change = currentValue - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

      results.push({
        model,
        currentValue: d3.sum(monthlyData, d => d.value),
        previousValue,
        change,
        changePercent,
        sparklineData: monthlyData,
        color: MODEL_COLORS[model] || '#666'
      });
    });

    // Sort results
    results.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'model': cmp = a.model.localeCompare(b.model); break;
        case 'value': cmp = a.currentValue - b.currentValue; break;
        case 'change': cmp = a.changePercent - b.changePercent; break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return results;
  }, [timePeriod, sortBy, sortAsc]);

  const renderSparklines = useCallback(() => {
    if (!containerRef.current) return;

    // Render sparklines for each model
    modelPerformance.forEach(model => {
      const container = containerRef.current?.querySelector(
        `.sparkline-cell[data-model="${model.model}"]`
      ) as HTMLElement;

      if (!container) return;

      // Clear previous
      container.innerHTML = '';

      const width = 120;
      const height = 32;
      const margin = { top: 4, right: 4, bottom: 4, left: 4 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const xScale = d3.scaleTime()
        .domain(d3.extent(model.sparklineData, d => d.date) as [Date, Date])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(model.sparklineData, d => d.value) as number])
        .range([innerHeight, 0]);

      // Area under the line
      const area = d3.area<typeof model.sparklineData[0]>()
        .x(d => xScale(d.date))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(model.sparklineData)
        .attr('d', area)
        .attr('fill', model.changePercent >= 0 ? 'rgba(52, 168, 83, 0.15)' : 'rgba(234, 67, 53, 0.15)');

      // Line
      const line = d3.line<typeof model.sparklineData[0]>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(model.sparklineData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', model.changePercent >= 0 ? '#34a853' : '#ea4335')
        .attr('stroke-width', 1.5);

      // End dot
      const lastPoint = model.sparklineData[model.sparklineData.length - 1];
      if (lastPoint) {
        g.append('circle')
          .attr('cx', xScale(lastPoint.date))
          .attr('cy', yScale(lastPoint.value))
          .attr('r', 3)
          .attr('fill', model.changePercent >= 0 ? '#34a853' : '#ea4335');
      }
    });
  }, [modelPerformance]);

  useEffect(() => {
    renderSparklines();
  }, [renderSparklines]);

  const handleSort = (column: 'model' | 'value' | 'change') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(false);
    }
  };

  const maxValue = useMemo(() =>
    Math.max(...modelPerformance.map(m => m.currentValue), 1),
    [modelPerformance]
  );

  return (
    <div className="test-drives-by-model stocks-style" ref={containerRef}>
      <div className="chart-header">
        <div className="header-left">
          <h3 className="chart-title">Test Drives by Model</h3>
          <p className="chart-subtitle">Performance comparison across Lexus models</p>
        </div>
        <div className="time-period-selector">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as TimePeriod[]).map(period => (
            <button
              key={period}
              className={`period-btn ${timePeriod === period ? 'active' : ''}`}
              onClick={() => setTimePeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="stocks-table">
        <div className="table-header">
          <div
            className={`th model-col sortable ${sortBy === 'model' ? 'sorted' : ''}`}
            onClick={() => handleSort('model')}
          >
            Model {sortBy === 'model' && (sortAsc ? '↑' : '↓')}
          </div>
          <div className="th chart-col">Trend</div>
          <div
            className={`th value-col sortable ${sortBy === 'value' ? 'sorted' : ''}`}
            onClick={() => handleSort('value')}
          >
            Test Drives {sortBy === 'value' && (sortAsc ? '↑' : '↓')}
          </div>
          <div
            className={`th change-col sortable ${sortBy === 'change' ? 'sorted' : ''}`}
            onClick={() => handleSort('change')}
          >
            Change {sortBy === 'change' && (sortAsc ? '↑' : '↓')}
          </div>
        </div>

        <div className="table-body">
          {modelPerformance.map((model, idx) => (
            <div key={model.model} className="table-row">
              <div className="td model-col">
                <span
                  className="model-indicator"
                  style={{ backgroundColor: model.color }}
                />
                <span className="model-name">{model.model}</span>
                <span className="model-rank">#{idx + 1}</span>
              </div>
              <div className="td chart-col">
                <div
                  className="sparkline-cell"
                  data-model={model.model}
                />
              </div>
              <div className="td value-col">
                <div className="value-bar-container">
                  <div
                    className="value-bar"
                    style={{
                      width: `${(model.currentValue / maxValue) * 100}%`,
                      backgroundColor: model.color
                    }}
                  />
                  <span className="value-text">
                    {model.currentValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={`td change-col ${model.changePercent >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-arrow">
                  {model.changePercent >= 0 ? '▲' : '▼'}
                </span>
                <span className="change-value">
                  {Math.abs(model.changePercent).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestDrivesByModel;
