import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { durationByModelDistribution } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './DurationByModel.css';

// Map model names to image filenames
const MODEL_IMAGES: Record<string, string> = {
  'UX300h': '/models/ux300h.png',
  'NX350': '/models/nx350.avif',
  'NX350h': '/models/nx350h.avif',
  'RX350': '/models/rx350.png',
  'RX350h': '/models/rx350h.png',
  'RX500h': '/models/rx500h.png',
  'LX600': '/models/lx600.png',
  'LX700h': '/models/lx700h.png',
  'IS300': '/models/is300.avif',
  'ES350': '/models/es350.png',
  'ES300h': '/models/es300h.png',
  'LS350': '/models/ls350.png',
  'LS500h': '/models/ls500h.png',
  'RC350': '/models/rc350.avif',
  'RC F': '/models/rcf.png',
  'LC500': '/models/lc500.png',
  'LC500 Convertible': '/models/lc500convertible.avif',
};

interface DurationByModelViolinProps {
  filters?: GlobalFilters;
  headless?: boolean;
}

// Kernel density estimation function
function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
  return function(V: number[]) {
    return X.map(x => [x, d3.mean(V, v => kernel(x - v)) || 0] as [number, number]);
  };
}

function kernelEpanechnikov(k: number) {
  return function(v: number) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

export function DurationByModelViolin({ filters: _filters, headless = false }: DurationByModelViolinProps) {
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
    const imageSize = 40; // Size for car model images
    const margin = { top: 30, right: 60, bottom: 40, left: 160 }; // Increased left margin for images
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
      .padding(0.2);

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

    // Calculate max density for scaling violin width
    const bandwidth = yScale.bandwidth();
    const violinWidth = bandwidth * 0.8;

    // Draw violins for each model
    sortedData.forEach((d) => {
      const yPos = yScale(d.model) || 0;
      const centerY = yPos + bandwidth / 2;

      // Kernel density estimation
      const kde = kernelDensityEstimator(
        kernelEpanechnikov(3),
        d3.range(d.min, d.max + 1, 1)
      );
      const density = kde(d.values);

      // Scale density to fit within bandwidth
      const maxDensity = d3.max(density, p => p[1]) || 1;
      const densityScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, violinWidth / 2]);

      // Create violin shape (area generator for both sides)
      const areaGenerator = d3.area<[number, number]>()
        .x0(p => xScale(p[0]))
        .x1(p => xScale(p[0]))
        .y0(p => centerY - densityScale(p[1]))
        .y1(p => centerY + densityScale(p[1]))
        .curve(d3.curveCatmullRom);

      // Draw violin
      g.append('path')
        .datum(density)
        .attr('class', 'violin')
        .attr('d', areaGenerator)
        .attr('fill', '#4285f4')
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#4285f4')
        .attr('stroke-width', 1);

      // Draw median line
      g.append('line')
        .attr('class', 'median-line')
        .attr('x1', xScale(d.median))
        .attr('x2', xScale(d.median))
        .attr('y1', centerY - violinWidth / 3)
        .attr('y2', centerY + violinWidth / 3)
        .attr('stroke', '#1a73e8')
        .attr('stroke-width', 2);

      // Draw median dot
      g.append('circle')
        .datum(d)
        .attr('class', 'median-dot')
        .attr('cx', xScale(d.median))
        .attr('cy', centerY)
        .attr('r', 5)
        .attr('fill', '#1a73e8')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Add median label
      g.append('text')
        .datum(d)
        .attr('class', 'median-label')
        .attr('x', xScale(d.median))
        .attr('y', centerY - violinWidth / 3 - 8)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#1a73e8')
        .text(`${d.avg}m`);
    });

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(45)) // Increased padding for images
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '11px');

    // Add car model images next to Y-axis labels
    g.selectAll('.model-image')
      .data(sortedData)
      .enter()
      .append('image')
      .attr('class', 'model-image')
      .attr('x', -40) // Position to the right of the model name
      .attr('y', d => (yScale(d.model) || 0) + bandwidth / 2 - imageSize / 2)
      .attr('width', imageSize)
      .attr('height', imageSize)
      .attr('href', d => MODEL_IMAGES[d.model] || '')
      .attr('preserveAspectRatio', 'xMidYMid meet');

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
        <h3 className="chart-title">Test Drive Duration by Model (Violin)</h3>
        {!headless && <p className="chart-subtitle">Distribution of test drive duration per vehicle model</p>}
      </div>

      {!headless && (
        <div className="legend-inline">
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#4285f4', opacity: 0.3 }} />
            Distribution
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

export default DurationByModelViolin;
