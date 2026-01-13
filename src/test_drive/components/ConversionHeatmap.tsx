import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { conversionByModelData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './ConversionHeatmap.css';

interface ConversionHeatmapProps {
  filters?: GlobalFilters;
  headless?: boolean;
  modelOrder?: string[];
}

export function ConversionHeatmap({ filters: _filters, headless = false, modelOrder }: ConversionHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const margin = { top: 60, right: 40, bottom: 20, left: 100 };
    const width = 600;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const stages = ['Leads', 'Qualified by CC', 'Completed'];

    // Determine model order
    const orderedModels = modelOrder || conversionByModelData.map(d => d.model);

    // Process data for heatmap
    const heatmapData: Array<{ model: string; stage: string; value: number; rate: number }> = [];
    orderedModels.forEach(model => {
      const d = conversionByModelData.find(item => item.model === model);
      if (d) {
        const completed = (d as any).completed || (d as any).completion || 0;
        heatmapData.push(
          { model: d.model, stage: 'Leads', value: d.leads, rate: 100 },
          { model: d.model, stage: 'Qualified by CC', value: d.qualified, rate: (d.qualified / d.leads) * 100 },
          { model: d.model, stage: 'Completed', value: completed, rate: (completed / d.leads) * 100 }
        );
      }
    });

    const maxValue = Math.max(...heatmapData.map(d => d.value));

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(stages)
      .range([0, innerWidth])
      .padding(0.08);

    const yScale = d3.scaleBand()
      .domain(orderedModels)
      .range([0, innerHeight])
      .padding(0.08);

    // Color scale
    const colorScale = d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolateBlues);

    // Cells
    g.selectAll('.cell')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.stage) || 0)
      .attr('y', d => yScale(d.model) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 2)
      .style('cursor', 'pointer');

    // Cell values
    g.selectAll('.cell-value')
      .data(heatmapData)
      .enter()
      .append('text')
      .attr('class', 'cell-value')
      .attr('x', d => (xScale(d.stage) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('fill', d => d.value > maxValue * 0.6 ? 'white' : '#333')
      .style('pointer-events', 'none')
      .text(d => d.value.toLocaleString());

    // X-axis (stages at top)
    g.append('g')
      .attr('class', 'x-axis')
      .call(d3.axisTop(xScale).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '600');

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '11px');

    // Legend
    const legendWidth = 150;
    const legendHeight = 10;
    const legendG = svg.append('g')
      .attr('transform', `translate(${width - margin.right - legendWidth}, 15)`);

    const gradientId = 'conv-heatmap-gradient';
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId);

    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      gradient.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', colorScale(t * maxValue));
    }

    legendG.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', `url(#${gradientId})`);

    legendG.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 12)
      .style('font-size', '10px')
      .text('0');

    legendG.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 12)
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .text(maxValue.toLocaleString());

  }, [modelOrder]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div className={`conversion-heatmap ${headless ? 'headless' : ''}`} ref={containerRef}>
      {!headless && (
        <div className="chart-header">
          <h3 className="chart-title">Test Drive Conversion by Model</h3>
          <p className="chart-subtitle">Funnel stages: Leads → Call Center Qualified → Sales Completed</p>
        </div>
      )}
      <div className="chart-area" />
    </div>
  );
}

export default ConversionHeatmap;
