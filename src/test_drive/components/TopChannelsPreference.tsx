import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './TopChannelsPreference.css';

interface ChannelPreferenceData {
  channel: string;
  count: number;
}

interface TopChannelsPreferenceProps {
  data: ChannelPreferenceData[];
  headless?: boolean;
}

// Channel colors
const CHANNEL_COLORS: Record<string, string> = {
  'Instagram': '#E4405F',
  'Facebook': '#1877F2',
  'TikTok': '#000000',
  'Website Organic': '#34a853',
  'Website Paid': '#4285f4',
  'Google Search': '#FBBC04',
  'Call Center': '#9334e6',
  'CRM': '#00bcd4',
  'WhatsApp': '#25D366'
};

// Channel icons (using simple text representations for now)
const CHANNEL_ICONS: Record<string, string> = {
  'Instagram': '📷',
  'Facebook': '📘',
  'TikTok': '🎵',
  'Website Organic': '🌐',
  'Website Paid': '💰',
  'Google Search': '🔍',
  'Call Center': '📞',
  'CRM': '📊',
  'WhatsApp': '💬'
};

export function TopChannelsPreference({ data, headless = false }: TopChannelsPreferenceProps) {
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

    const margin = { top: 10, right: 45, bottom: 10, left: 100 };
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
      .domain(sortedData.map(d => d.channel))
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
      .attr('y', d => yScale(d.channel) || 0)
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => CHANNEL_COLORS[d.channel] || '#4285f4')
      .attr('rx', 3);

    // Value labels at end of bars
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.count) + 5)
      .attr('y', d => (yScale(d.channel) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text(d => d.count.toLocaleString());

    // Channel name labels on left
    g.selectAll('.channel-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'channel-label')
      .attr('x', -8)
      .attr('y', d => (yScale(d.channel) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => d.channel);

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
    <div className={`top-channels-preference ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Top 5 Channel Preferences</h3>
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default TopChannelsPreference;
