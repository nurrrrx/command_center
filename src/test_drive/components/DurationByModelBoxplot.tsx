import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { durationByModelDistribution } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './DurationByModel.css';

interface DurationByModelBoxplotProps {
  filters?: GlobalFilters;
  headless?: boolean;
}

export function DurationByModelBoxplot({ filters: _filters, headless = false }: DurationByModelBoxplotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get actual dimensions from container for responsive sizing
    const containerWidth = chartArea.clientWidth || 600;
    const containerHeight = chartArea.clientHeight || 450;
    const margin = { top: 30, right: 60, bottom: 40, left: 80 };
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Sort by average duration
    const sortedData = [...durationByModelDistribution].sort((a, b) => b.avg - a.avg);

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('display', 'block');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.model))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, 70])
      .range([0, innerWidth]);

    // Grid lines
    const ticks = [10, 20, 30, 40, 50, 60];
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(ticks)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '2,2');

    const boxHeight = yScale.bandwidth();

    // Draw boxplots for each model
    sortedData.forEach((d) => {
      const yPos = yScale(d.model) || 0;
      const centerY = yPos + boxHeight / 2;

      // Whisker line (min to max)
      g.append('line')
        .datum(d)
        .attr('class', 'whisker-line')
        .attr('x1', xScale(d.min))
        .attr('x2', xScale(d.max))
        .attr('y1', centerY)
        .attr('y2', centerY)
        .attr('stroke', '#999')
        .attr('stroke-width', 1);

      // Min whisker cap
      g.append('line')
        .attr('class', 'whisker-cap')
        .attr('x1', xScale(d.min))
        .attr('x2', xScale(d.min))
        .attr('y1', centerY - boxHeight * 0.15)
        .attr('y2', centerY + boxHeight * 0.15)
        .attr('stroke', '#999')
        .attr('stroke-width', 1);

      // Max whisker cap
      g.append('line')
        .attr('class', 'whisker-cap')
        .attr('x1', xScale(d.max))
        .attr('x2', xScale(d.max))
        .attr('y1', centerY - boxHeight * 0.15)
        .attr('y2', centerY + boxHeight * 0.15)
        .attr('stroke', '#999')
        .attr('stroke-width', 1);

      // IQR box (Q1 to Q3)
      g.append('rect')
        .datum(d)
        .attr('class', 'iqr-box')
        .attr('x', xScale(d.q1))
        .attr('y', yPos + boxHeight * 0.15)
        .attr('width', xScale(d.q3) - xScale(d.q1))
        .attr('height', boxHeight * 0.7)
        .attr('fill', '#4285f4')
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#4285f4')
        .attr('stroke-width', 1);

      // Median line
      g.append('line')
        .datum(d)
        .attr('class', 'median-line')
        .attr('x1', xScale(d.median))
        .attr('x2', xScale(d.median))
        .attr('y1', yPos + boxHeight * 0.15)
        .attr('y2', yPos + boxHeight * 0.85)
        .attr('stroke', '#1a73e8')
        .attr('stroke-width', 2);

      // Median dot
      g.append('circle')
        .datum(d)
        .attr('class', 'median-dot')
        .attr('cx', xScale(d.median))
        .attr('cy', centerY)
        .attr('r', 4)
        .attr('fill', '#1a73e8')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5);

      // Median label
      g.append('text')
        .datum(d)
        .attr('class', 'median-label')
        .attr('x', xScale(d.median))
        .attr('y', yPos + boxHeight * 0.05)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#1a73e8')
        .text(`${d.avg}m`);
    });

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '11px');

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(ticks).tickFormat(d => `${d}min`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // X-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Duration (minutes)');

  }, []);

  useEffect(() => {
    // Delay initial render to ensure container is properly sized
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 50);

    // Re-render chart on container resize
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
    <div className={`duration-by-model ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drive Duration by Model (Boxplot)</h3>
        {!headless && <p className="chart-subtitle">Distribution of test drive duration per vehicle model</p>}
      </div>

      {!headless && (
        <div className="legend-inline">
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#4285f4', opacity: 0.3 }} />
            IQR (Q1-Q3)
          </span>
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#1a73e8' }} />
            Median
          </span>
        </div>
      )}

      <div className="chart-area" />
    </div>
  );
}

export default DurationByModelBoxplot;
