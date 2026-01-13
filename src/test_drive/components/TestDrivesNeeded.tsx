import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { testDrivesNeededData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './TestDrivesNeeded.css';

interface TestDrivesNeededProps {
  filters?: GlobalFilters;
  headless?: boolean;
}

export function TestDrivesNeeded({ filters: _filters, headless = false }: TestDrivesNeededProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const width = 500;
    const height = 200;

    const colors = ['#34a853', '#fbbc04', '#ea4335'];

    // Prepare data for treemap
    const hierarchyData = {
      name: 'root',
      children: testDrivesNeededData.map((d, i) => ({
        name: d.category,
        value: d.count,
        percentage: d.percentage,
        color: colors[i]
      }))
    };

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData)
      .sum(d => (d as any).value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    d3.treemap<typeof hierarchyData>()
      .size([width, height])
      .padding(3)
      .round(true)(root);

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', 'inherit');

    // Create cells
    const cell = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell.append('rect')
      .attr('class', 'segment')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => (d.data as any).color)
      .attr('rx', 4);

    // Add percentage labels
    cell.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 - 12)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', d => {
        const width = d.x1 - d.x0;
        return width > 100 ? '24px' : '18px';
      })
      .style('font-weight', '700')
      .style('fill', 'white')
      .text(d => `${(d.data as any).percentage}%`);

    // Add category labels
    cell.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 + 12)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', d => {
        const width = d.x1 - d.x0;
        return width > 100 ? '13px' : '11px';
      })
      .style('fill', 'rgba(255,255,255,0.9)')
      .text(d => (d.data as any).name);

    // Add count labels
    cell.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 + 30)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('fill', 'rgba(255,255,255,0.7)')
      .text(d => `(${(d.value || 0).toLocaleString()} orders)`);

  }, []);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div className={`test-drives-needed ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drives Needed to Complete an Order</h3>
        {!headless && <p className="chart-subtitle">Distribution of test drives required before purchase</p>}
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default TestDrivesNeeded;
