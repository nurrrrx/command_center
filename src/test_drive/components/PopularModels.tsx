import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { popularModelsData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './PopularModels.css';

interface PopularModelsProps {
  filters?: GlobalFilters;
  headless?: boolean;
  modelOrder?: string[];
}

export function PopularModels({ filters, headless = false, modelOrder }: PopularModelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const margin = { top: 20, right: 80, bottom: 40, left: 80 };
    const width = 700;
    const height = 450;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter by model if specified
    let filteredData = [...popularModelsData];
    if (filters?.model) {
      filteredData = filteredData.filter(d => d.model === filters.model);
    }

    // Use provided model order or sort by test drives
    let sortedData: typeof filteredData;
    if (modelOrder) {
      // Order data according to modelOrder
      sortedData = modelOrder
        .map(model => filteredData.find(d => d.model === model))
        .filter((d): d is typeof filteredData[0] => d !== undefined);
    } else {
      sortedData = filteredData.sort((a, b) => b.testDrives - a.testDrives);
    }

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.model))
      .range([0, innerHeight])
      .padding(0.25);

    const xScale = d3.scaleLinear()
      .domain([0, Math.max(...sortedData.map(d => d.testDrives)) * 1.15])
      .range([0, innerWidth]);

    // Color scale based on rank
    const colorScale = d3.scaleSequential()
      .domain([0, sortedData.length - 1])
      .interpolator(d3.interpolateBlues);

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
      .attr('class', 'bar')
      .attr('y', d => yScale(d.model) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.testDrives))
      .attr('fill', (_, i) => colorScale(sortedData.length - 1 - i))
      .attr('rx', 3);

    // Value labels
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
      .attr('x', d => xScale(d.testDrives) + 8)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#333')
      .text(d => d.testDrives.toLocaleString());

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d3.format(',')(d as number)))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // X-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Number of Test Drives');

  }, [filters?.model, modelOrder]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div className={`popular-models ${headless ? 'headless' : ''}`} ref={containerRef}>
      {!headless && (
        <div className="chart-header">
          <h3 className="chart-title">Popular Models</h3>
          <p className="chart-subtitle">Test drive volume by Lexus model</p>
        </div>
      )}
      <div className="chart-area" />
    </div>
  );
}

export default PopularModels;
