import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './LeaderboardScatter.css';

interface LeaderboardData {
  name: string;
  value: number;
  conversions: number;
  conversionRate: number;
  color?: string;
}

interface LeaderboardScatterProps {
  data: LeaderboardData[];
  valueLabel?: string;
  selectedName?: string | null;
  onSelect?: (name: string | null) => void;
  sortBy?: 'value' | 'conversion';
}

export function LeaderboardScatter({ data, valueLabel = 'Test Drives', selectedName, onSelect, sortBy = 'value' }: LeaderboardScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.scatter-chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get actual container dimensions for responsive sizing
    const containerWidth = chartArea.clientWidth || 400;
    const containerHeight = chartArea.clientHeight || 200;

    const margin = { top: 15, right: 20, bottom: 35, left: 45 };
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Calculate averages for quadrant lines
    const avgValue = d3.mean(data, d => d.value) || 0;
    const avgConversion = d3.mean(data, d => d.conversionRate) || 0;

    // Calculate min/max with padding to center averages better
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const minConversion = Math.min(...data.map(d => d.conversionRate));
    const maxConversion = Math.max(...data.map(d => d.conversionRate));

    // Add padding to ensure average lines are more centered
    const valueRange = maxValue - minValue;
    const conversionRange = maxConversion - minConversion;
    const valuePadding = valueRange * 0.15;
    const conversionPadding = conversionRange * 0.15;

    const xScale = d3.scaleLinear()
      .domain([Math.max(0, minValue - valuePadding), maxValue + valuePadding])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, minConversion - conversionPadding), maxConversion + conversionPadding])
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line.horizontal')
      .data(yScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .selectAll('line.vertical')
      .data(xScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '2,2');

    // Average lines (quadrant dividers)
    g.append('line')
      .attr('class', 'avg-line')
      .attr('x1', xScale(avgValue))
      .attr('x2', xScale(avgValue))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    g.append('line')
      .attr('class', 'avg-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(avgConversion))
      .attr('y2', yScale(avgConversion))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Sort data to get ranks (same logic as Leaderboard)
    const sortedData = [...data].sort((a, b) => {
      if (sortBy === 'conversion') return b.conversionRate - a.conversionRate;
      return b.value - a.value;
    });

    // Create a map of name to rank
    const rankMap = new Map<string, number>();
    sortedData.forEach((d, i) => rankMap.set(d.name, i + 1));

    // Scatter points
    const points = g.selectAll('.point')
      .data(data)
      .enter()
      .append('g')
      .attr('class', d => `point ${selectedName === d.name ? 'selected' : ''}`)
      .attr('transform', d => `translate(${xScale(d.value)}, ${yScale(d.conversionRate)})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onSelect) {
          onSelect(selectedName === d.name ? null : d.name);
        }
      });

    points.append('circle')
      .attr('r', d => selectedName === d.name ? 6 : 4)
      .attr('fill', d => selectedName === d.name ? '#ea4335' : '#4285f4')
      .attr('fill-opacity', d => selectedName && selectedName !== d.name ? 0.3 : 0.7)
      .attr('stroke', d => selectedName === d.name ? '#ea4335' : '#4285f4')
      .attr('stroke-width', d => selectedName === d.name ? 2 : 1);

    // Add rank number label for top 10 or selected point
    points.filter(d => {
      const rank = rankMap.get(d.name) || 0;
      return rank <= 10 || selectedName === d.name;
    })
      .append('text')
      .attr('class', 'point-label')
      .attr('x', 6)
      .attr('y', 3)
      .style('font-size', '8px')
      .style('font-weight', d => selectedName === d.name ? '700' : '500')
      .style('fill', d => selectedName === d.name ? '#ea4335' : '#666')
      .text(d => `#${rankMap.get(d.name)}`);

    // Tooltip on hover
    points.append('title')
      .text(d => `#${rankMap.get(d.name)} ${d.name}\n${valueLabel}: ${d.value.toLocaleString()}\nConversion: ${d.conversionRate.toFixed(1)}%`);

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(4).tickFormat(d => d3.format(',')(d as number)))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // X-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(valueLabel);

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `${d}%`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // Y-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text('Conversion %');

  }, [data, valueLabel, selectedName, onSelect, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 50);

    const chartArea = containerRef.current?.querySelector('.scatter-chart-area') as HTMLElement;
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

  return (
    <div className="leaderboard-scatter" ref={containerRef}>
      <div className="scatter-chart-area" />
    </div>
  );
}

export default LeaderboardScatter;
