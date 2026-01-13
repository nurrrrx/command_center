import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './TopShowroomsPreference.css';

interface ShowroomPreferenceData {
  showroom: string;
  count: number;
}

interface TopShowroomsPreferenceProps {
  data: ShowroomPreferenceData[];
  headless?: boolean;
}

// Showroom colors
const SHOWROOM_COLORS: Record<string, string> = {
  'DFC': '#4285f4',
  'Sheikh Zayed Road': '#34a853',
  'DIP': '#03a9f4',
  'Abu Dhabi': '#fbbc04',
  'Sharjah': '#ea4335',
  'Khorfakkan': '#e91e63',
  'Ras Al Khaimah': '#00bcd4',
  'Ajman': '#3f51b5',
  'Fujairah': '#ff5722',
  'Umm Al Quwain': '#795548',
  'Al Ain': '#9334e6'
};

// Showroom icons (location markers)
const SHOWROOM_ICON = '📍';

export function TopShowroomsPreference({ data, headless = false }: TopShowroomsPreferenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const containerWidth = chartArea.clientWidth || 300;
    const containerHeight = chartArea.clientHeight || 300;

    // Sort by count descending and take top 5
    const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 5);

    const margin = { top: 10, right: 45, bottom: 10, left: 110 };
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales - horizontal bar chart
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.showroom))
      .range([0, innerHeight])
      .padding(0.3);

    const maxValue = Math.max(...sortedData.map(d => d.count));
    const xScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, innerWidth]);

    // Grid lines (vertical)
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '2,2');

    // Horizontal bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.showroom) || 0)
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => SHOWROOM_COLORS[d.showroom] || '#4285f4')
      .attr('rx', 3);

    // Value labels at end of bars
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.count) + 5)
      .attr('y', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text(d => d.count.toLocaleString());

    // Showroom name labels on left
    g.selectAll('.showroom-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'showroom-label')
      .attr('x', -8)
      .attr('y', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => d.showroom);

  }, [data]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 50);

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

  return (
    <div className={`top-showrooms-preference ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Top 5 Showroom Preferences</h3>
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default TopShowroomsPreference;
