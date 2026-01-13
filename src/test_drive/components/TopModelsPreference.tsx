import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './TopModelsPreference.css';

interface ModelPreferenceData {
  model: string;
  count: number;
  type: string;
}

interface TopModelsPreferenceProps {
  data: ModelPreferenceData[];
  headless?: boolean;
}

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

// Single consistent color for all bars
const BAR_COLOR = '#163E93';

export function TopModelsPreference({ data, headless = false }: TopModelsPreferenceProps) {
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

    const margin = { top: 10, right: 45, bottom: 10, left: 80 };
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
      .domain(sortedData.map(d => d.model))
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
      .attr('y', d => yScale(d.model) || 0)
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('fill', BAR_COLOR)
      .attr('rx', 3);

    // Value labels at end of bars
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.count) + 5)
      .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text(d => d.count.toLocaleString());

    // Model name labels on left
    g.selectAll('.model-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'model-label')
      .attr('x', -8)
      .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => d.model);

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
    <div className={`top-models-preference ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Top 5 Model Preferences</h3>
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default TopModelsPreference;
