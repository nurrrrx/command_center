import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { completionData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './TestDriveCompletion.css';

interface TestDriveCompletionProps {
  filters?: GlobalFilters;
}

export function TestDriveCompletion({ filters: _filters }: TestDriveCompletionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const containerWidth = chartArea.clientWidth || 300;
    const containerHeight = chartArea.clientHeight || 300;
    const size = Math.min(containerWidth, containerHeight);
    const radius = size / 2;
    const innerRadius = radius * 0.6;

    const data = [
      { label: 'Completed', value: completionData.completed, color: '#025645' },
      { label: 'Not Completed', value: completionData.notCompleted, color: '#BF0404' }
    ];

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('display', 'block');

    const g = svg.append('g')
      .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);

    const pie = d3.pie<typeof data[0]>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02);

    const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 5);

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });

    // Percentage labels on arcs
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .style('font-weight', '600')
      .style('fill', 'white')
      .text(d => `${((d.data.value / completionData.total) * 100).toFixed(0)}%`);

    // Center text - Total
    g.append('text')
      .attr('class', 'center-total')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .style('font-weight', '700')
      .style('fill', '#1a1a1a')
      .text(completionData.total.toLocaleString());

    g.append('text')
      .attr('class', 'center-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', '11px')
      .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .style('fill', '#666')
      .text('Total Test Drives');

  }, []);

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
    <div className="test-drive-completion" ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Completion Rate</h3>
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default TestDriveCompletion;
