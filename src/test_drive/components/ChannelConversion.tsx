import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { leadSourcesData, LEAD_SOURCE_COLORS } from '../data/mockData';
import './ChannelConversion.css';

interface ChannelConversionProps {
  headless?: boolean;
  selectedSource?: string | null;
  onSourceSelect?: (source: string | null) => void;
}

export function ChannelConversion({ headless = false, selectedSource, onSourceSelect }: ChannelConversionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    // Clear previous
    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get container dimensions for headless mode
    const containerRect = chartArea.getBoundingClientRect();
    const containerWidth = containerRect.width || 700;
    const containerHeight = containerRect.height || 400;

    // Use container size in headless mode, fixed size otherwise
    const margin = headless
      ? { top: 30, right: 50, bottom: 40, left: 100 }
      : { top: 40, right: 60, bottom: 60, left: 120 };
    const width = headless ? containerWidth : 700;
    const height = headless ? containerHeight : 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Sort data by conversion rate
    const sortedData = [...leadSourcesData].sort((a, b) => b.conversion - a.conversion);

    // Calculate average for reference line
    const avgValue = d3.mean(sortedData, d => d.conversion) || 0;

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', headless ? '100%' : width)
      .attr('height', headless ? '100%' : height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.source))
      .range([0, innerHeight])
      .padding(0.2);

    const maxValue = Math.max(...sortedData.map(d => d.conversion));

    const xScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, innerWidth]);

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

    // Bars with source colors
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.source) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.conversion))
      .attr('fill', d => LEAD_SOURCE_COLORS[d.source] || '#4285f4')
      .attr('opacity', d => selectedSource === null || selectedSource === d.source ? 1 : 0.3)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        if (onSourceSelect) {
          onSourceSelect(selectedSource === d.source ? null : d.source);
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function(_, d) {
        d3.select(this).attr('opacity', selectedSource === null || selectedSource === d.source ? 1 : 0.3);
      });

    // Value labels
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', d => (yScale(d.source) || 0) + yScale.bandwidth() / 2)
      .attr('x', d => xScale(d.conversion) + 8)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => `${d.conversion.toFixed(1)}%`);

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
      .style('font-size', '11px')
      .style('fill', '#BF0404')
      .style('font-weight', '600')
      .text(`Avg: ${avgValue.toFixed(1)}%`);

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '12px');

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${d}%`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

  }, [headless, selectedSource, onSourceSelect]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Re-render on resize for headless mode
  useEffect(() => {
    if (!headless || !containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });

    resizeObserver.observe(chartArea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [headless, renderChart]);

  return (
    <div className={`channel-conversion ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Sources by Conversion Rate</h3>
        {!headless && <p className="chart-subtitle">Lead sources ranked by conversion percentage</p>}
      </div>

      <div className="chart-area" />
    </div>
  );
}

export default ChannelConversion;
