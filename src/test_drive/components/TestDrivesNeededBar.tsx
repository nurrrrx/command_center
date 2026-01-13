import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { testDrivesNeededData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './TestDrivesNeededBar.css';

interface TestDrivesNeededBarProps {
  filters?: GlobalFilters;
  headless?: boolean;
}

export function TestDrivesNeededBar({ filters: _filters, headless = false }: TestDrivesNeededBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get actual width from container
    const containerWidth = chartArea.clientWidth || 500;
    const width = containerWidth;
    const height = 50;
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const innerWidth = width;
    const innerHeight = height;

    const colors = ['#34a853', '#fbbc04', '#ea4335'];

    // Calculate cumulative positions for stacked bar
    let cumulative = 0;
    const stackedData = testDrivesNeededData.map((d, i) => {
      const item = {
        ...d,
        x0: cumulative,
        x1: cumulative + d.percentage,
        color: colors[i]
      };
      cumulative += d.percentage;
      return item;
    });

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none')
      .style('font-family', 'inherit')
      .style('display', 'block');

    const g = svg.append('g');

    // Scale for the bar
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    // Create stacked bar segments
    const segments = g.selectAll('.segment')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'segment-group');

    // Add rectangles (no rounded corners)
    segments.append('rect')
      .attr('class', 'segment')
      .attr('x', d => xScale(d.x0))
      .attr('y', 0)
      .attr('width', d => xScale(d.x1 - d.x0))
      .attr('height', innerHeight)
      .attr('fill', d => d.color);

    // Add percentage labels inside segments
    segments.append('text')
      .attr('x', d => xScale(d.x0) + xScale(d.x1 - d.x0) / 2)
      .attr('y', innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', d => {
        const segmentWidth = xScale(d.x1 - d.x0);
        return segmentWidth > 60 ? '14px' : '11px';
      })
      .style('font-weight', '600')
      .style('fill', 'white')
      .text(d => {
        const segmentWidth = xScale(d.x1 - d.x0);
        // Only show percentage if segment is wide enough
        if (segmentWidth > 40) {
          return `${d.percentage}%`;
        }
        return '';
      });

  }, []);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div className={`test-drives-needed-bar ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drives Needed to Complete an Order</h3>
      </div>
      <div className="chart-area" />
      <div className="bar-legend">
        {testDrivesNeededData.map((d, i) => (
          <div key={d.category} className="legend-item">
            <span
              className="legend-swatch"
              style={{ backgroundColor: ['#34a853', '#fbbc04', '#ea4335'][i] }}
            />
            <span className="legend-label">{d.category}</span>
            <span className="legend-value">({d.count.toLocaleString()} orders)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestDrivesNeededBar;
