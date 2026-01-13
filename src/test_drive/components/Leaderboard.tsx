import { useCallback, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './Leaderboard.css';

type MetricType = 'absolute' | 'conversion';

interface LeaderboardData {
  name: string;
  value: number;
  conversions: number;
  conversionRate: number;
  color?: string;
  group?: string;
}

interface GroupLegendItem {
  label: string;
  color: string;
}

interface LeaderboardProps {
  title: string;
  subtitle?: string;
  data: LeaderboardData[];
  valueLabel?: string;
  showGroupColors?: boolean;
  groupLegend?: GroupLegendItem[];
  onLegendClick?: (group: string | null) => void;
  selectedGroup?: string | null;
  headless?: boolean;
  selectedName?: string | null;
  onSelectName?: (name: string | null) => void;
}

export function Leaderboard({
  title,
  subtitle,
  data,
  valueLabel = 'Test Drives',
  showGroupColors = false,
  groupLegend,
  onLegendClick,
  selectedGroup,
  headless = false,
  selectedName,
  onSelectName
}: LeaderboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [metric, setMetric] = useState<MetricType>('absolute');

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    const xAxisArea = containerRef.current.querySelector('.x-axis-area') as HTMLElement;
    if (!chartArea || !xAxisArea) return;

    // Clear existing SVGs
    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();
    const existingXAxisSvg = xAxisArea.querySelector('svg');
    if (existingXAxisSvg) existingXAxisSvg.remove();

    // Get actual container dimensions for responsive sizing
    const containerWidth = chartArea.clientWidth || 650;

    // Calculate height based on number of items (28px per bar + padding)
    const barHeight = 28;
    const margin = { top: 25, right: 40, bottom: 5, left: 130 };
    const xAxisHeight = 25;

    // Sort data based on current metric
    const sortedData = [...data].sort((a, b) => {
      if (metric === 'conversion') return b.conversionRate - a.conversionRate;
      return b.value - a.value;
    });

    // Calculate dynamic height based on data length
    const calculatedInnerHeight = sortedData.length * barHeight;
    const width = containerWidth;
    const height = calculatedInnerHeight + margin.top + margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = calculatedInnerHeight;

    // Calculate average
    const avgValue = metric === 'conversion'
      ? d3.mean(sortedData, d => d.conversionRate) || 0
      : d3.mean(sortedData, d => d.value) || 0;

    const maxValue = metric === 'conversion'
      ? Math.max(...sortedData.map(d => d.conversionRate))
      : Math.max(...sortedData.map(d => d.value));

    const xScale = d3.scaleLinear()
      .domain([0, maxValue * 1.15])
      .range([0, innerWidth]);

    // Main chart SVG (scrollable area - no x-axis)
    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.25);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '2,2');

    // Bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', d => `bar ${selectedName === d.name ? 'selected' : ''}`)
      .attr('y', d => yScale(d.name) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(metric === 'conversion' ? d.conversionRate : d.value))
      .attr('fill', d => {
        if (selectedName === d.name) return '#BF0404';
        if (selectedName && selectedName !== d.name) return showGroupColors && d.color ? d.color : '#163E93';
        return showGroupColors && d.color ? d.color : '#163E93';
      })
      .attr('fill-opacity', d => selectedName && selectedName !== d.name ? 0.3 : 1)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onSelectName) {
          onSelectName(selectedName === d.name ? null : d.name);
        }
      });

    // Value labels
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('x', d => xScale(metric === 'conversion' ? d.conversionRate : d.value) + 8)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', d => selectedName === d.name ? '#BF0404' : '#333')
      .style('font-weight', d => selectedName === d.name ? '600' : '400')
      .style('opacity', d => selectedName && selectedName !== d.name ? 0.4 : 1)
      .text(d => metric === 'conversion' ? `${d.conversionRate.toFixed(1)}%` : d.value.toLocaleString());

    // Average line
    g.append('line')
      .attr('class', 'avg-line')
      .attr('x1', xScale(avgValue))
      .attr('x2', xScale(avgValue))
      .attr('y1', -10)
      .attr('y2', innerHeight + 10)
      .attr('stroke', '#BF0404')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('class', 'avg-label')
      .attr('x', xScale(avgValue))
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#BF0404')
      .style('font-weight', '600')
      .text(`Avg: ${metric === 'conversion' ? avgValue.toFixed(1) + '%' : Math.round(avgValue).toLocaleString()}`);

    // Y-axis with rank numbers
    const yAxis = g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10).tickFormat((d) => {
        const index = sortedData.findIndex(item => item.name === d);
        return `#${index + 1} - ${d}`;
      }))
      .call(g => g.select('.domain').remove());

    yAxis.selectAll('text')
      .style('font-size', '11px')
      .style('fill', d => {
        const name = String(d).replace(/^#\d+\s-\s/, '');
        if (selectedName === name) return '#BF0404';
        if (showGroupColors) {
          const item = sortedData.find(item => item.name === name);
          return item?.color || '#333';
        }
        return '#333';
      })
      .style('font-weight', d => {
        const name = String(d).replace(/^#\d+\s-\s/, '');
        return selectedName === name ? '600' : (showGroupColors ? '500' : '400');
      })
      .style('opacity', d => {
        const name = String(d).replace(/^#\d+\s-\s/, '');
        return selectedName && selectedName !== name ? 0.4 : 1;
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onSelectName) {
          const name = String(d).replace(/^#\d+\s-\s/, '');
          onSelectName(selectedName === name ? null : name);
        }
      });

    // Fixed X-axis SVG (separate, non-scrolling)
    const xAxisSvg = d3.select(xAxisArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', xAxisHeight)
      .attr('viewBox', `0 0 ${width} ${xAxisHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    const xAxisG = xAxisSvg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`);

    xAxisG.append('g')
      .attr('class', 'x-axis')
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => metric === 'conversion' ? `${d}%` : d3.format(',')(d as number)))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

  }, [data, metric, showGroupColors, selectedName, onSelectName]);

  useEffect(() => {
    // Delay initial render to ensure container is properly sized
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 50);

    // Re-render on container resize
    const chartArea = containerRef.current?.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });
    resizeObserver.observe(chartArea);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [renderChart]);

  const handleLegendClick = (label: string) => {
    if (onLegendClick) {
      // Toggle: if clicking the same one, clear filter
      onLegendClick(selectedGroup === label ? null : label);
    }
  };

  return (
    <div className={`leaderboard ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        {!headless && (
          <div className="header-left">
            <h3 className="chart-title">{title}</h3>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        )}
        {headless && <h3 className="chart-title">{title}</h3>}
        <div className="chart-toggle">
          <button
            className={`toggle-btn ${metric === 'absolute' ? 'active' : ''}`}
            onClick={() => setMetric('absolute')}
          >
            Volume
          </button>
          <button
            className={`toggle-btn ${metric === 'conversion' ? 'active' : ''}`}
            onClick={() => setMetric('conversion')}
          >
            % Conversion
          </button>
        </div>
      </div>

      {groupLegend && groupLegend.length > 0 && (
        <div className="group-legend">
          {groupLegend.map((item, index) => (
            <div
              key={index}
              className={`legend-item ${onLegendClick ? 'clickable' : ''} ${selectedGroup === item.label ? 'selected' : ''}`}
              onClick={() => handleLegendClick(item.label)}
            >
              <span className="legend-swatch" style={{ backgroundColor: item.color }} />
              <span className="legend-label">{item.label}</span>
            </div>
          ))}
          {selectedGroup && (
            <button
              className="clear-filter-btn"
              onClick={() => onLegendClick?.(null)}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      <div className="chart-area" />
      <div className="x-axis-area" />
    </div>
  );
}

export default Leaderboard;
