import { useState, useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { salesFunnelData, salesFunnelBySource, LEAD_SOURCE_COLORS } from '../data/mockData';
import './SalesFunnel.css';

interface SalesFunnelProps {
  headless?: boolean;
  selectedSource?: string | null;
  onSourceSelect?: (source: string | null) => void;
}

export function SalesFunnel({ headless = false, selectedSource: externalSelectedSource, onSourceSelect }: SalesFunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalSelectedSource, setInternalSelectedSource] = useState<string | null>(null);

  // Use external source if provided, otherwise use internal state
  const selectedSource = externalSelectedSource !== undefined ? externalSelectedSource : internalSelectedSource;

  const handleSourceSelect = useCallback((source: string | null) => {
    if (onSourceSelect) {
      onSourceSelect(source);
    } else {
      setInternalSelectedSource(source);
    }
  }, [onSourceSelect]);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    // Clear previous
    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get container dimensions for headless mode
    const containerRect = chartArea.getBoundingClientRect();
    const containerWidth = containerRect.width || 950;
    const containerHeight = containerRect.height || 480;

    // Use container size in headless mode, fixed size otherwise
    // Top margin reduced since legend is now HTML, left for labels, right for drop-off indicators
    const margin = headless
      ? { top: 20, right: 95, bottom: 10, left: 115 }
      : { top: 20, right: 110, bottom: 20, left: 130 };
    const width = headless ? containerWidth : 950;
    const height = headless ? containerHeight : 480;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', headless ? '100%' : '100%')
      .attr('height', headless ? '100%' : height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', headless ? 'xMidYMid meet' : 'xMidYMid meet')
      .style('display', 'block')
      .style('margin', '0 auto');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Get data based on selection
    const funnelData = selectedSource
      ? (() => {
          const sourceData = salesFunnelBySource.find(s => s.source === selectedSource);
          if (!sourceData) return salesFunnelData.stages;
          return [
            { name: 'Test Drive Leads', value: sourceData.requests, description: 'Test drive requests' },
            { name: 'Call Center Qualified', value: sourceData.qualified, description: 'Leads qualified' },
            { name: 'Sales Exec Booked', value: sourceData.booked, description: 'Appointments booked' },
            { name: 'Completed', value: sourceData.completed, description: 'Test drives completed' },
            { name: 'Orders', value: sourceData.orders, description: 'Orders placed' },
            { name: 'Invoices', value: sourceData.invoices, description: 'Invoiced orders' },
          ];
        })()
      : salesFunnelData.stages.map((stage, i) => ({
          ...stage,
          name: i === 0 ? 'Test Drive Leads' : stage.name
        }));

    // Calculate funnel dimensions - make funnel as wide as possible
    const stages = funnelData;
    const maxValue = stages[0].value;
    const maxFunnelWidth = innerWidth; // Full width
    const minWidth = maxFunnelWidth * 0.3;
    const centerX = innerWidth / 2;

    // Legend is now rendered as HTML outside SVG for better layout control

    // Stacked bar for lead sources - same width as top funnel level
    const barHeight = 35;
    const barTopIndent = 10; // Top indentation for clear filter button
    const barY = barTopIndent;
    const totalRequests = salesFunnelBySource.reduce((sum, s) => sum + s.requests, 0);
    const stackedBarWidth = maxFunnelWidth; // Same as funnel width
    const stackedBarX = 0; // Start from left edge

    // Draw stacked bar background
    g.append('rect')
      .attr('x', stackedBarX)
      .attr('y', barY)
      .attr('width', stackedBarWidth)
      .attr('height', barHeight)
      .attr('fill', '#f5f5f5');

    // Draw stacked segments with labels inside
    let xOffset = stackedBarX;
    salesFunnelBySource.forEach((source) => {
      const segmentWidth = (source.requests / totalRequests) * stackedBarWidth;
      const pct = ((source.requests / totalRequests) * 100).toFixed(1);

      g.append('rect')
        .attr('x', xOffset)
        .attr('y', barY)
        .attr('width', segmentWidth)
        .attr('height', barHeight)
        .attr('fill', LEAD_SOURCE_COLORS[source.source] || '#999')
        .attr('opacity', selectedSource === null || selectedSource === source.source ? 1 : 0.3)
        .style('cursor', 'pointer')
        .on('click', () => {
          handleSourceSelect(selectedSource === source.source ? null : source.source);
        })
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity',
            selectedSource === null || selectedSource === source.source ? 1 : 0.3);
        })
        .append('title')
        .text(`${source.source}\n${source.requests.toLocaleString()} requests (${pct}%)`);

      // Add label inside stacked bar segments (label only, no value)
      const segmentCenterX = xOffset + segmentWidth / 2;
      const segmentCenterY = barY + barHeight / 2;

      if (segmentWidth > 80) {
        // Wide segment: show full label centered
        g.append('text')
          .attr('x', segmentCenterX)
          .attr('y', segmentCenterY)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .style('font-weight', '600')
          .style('fill', 'white')
          .style('pointer-events', 'none')
          .text(source.source);
      } else if (segmentWidth > 45) {
        // Medium segment: show abbreviated label
        g.append('text')
          .attr('x', segmentCenterX)
          .attr('y', segmentCenterY)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .style('font-weight', '500')
          .style('fill', 'white')
          .style('pointer-events', 'none')
          .text(source.source.length > 6 ? source.source.substring(0, 5) + '..' : source.source);
      }
      // Narrow segments: no label (tooltip shows full details on hover)

      xOffset += segmentWidth;
    });

    // Funnel starts below stacked bar
    const funnelStartY = barY + barHeight + 20;
    const funnelHeight = innerHeight - funnelStartY;

    // Funnel stages layout (dimensions already calculated above)
    const stageHeight = funnelHeight / stages.length;

    // Color scale - gradient from McKinsey blue to BCG green
    const colorScale = d3.scaleLinear<string>()
      .domain([0, stages.length - 1])
      .range(['#163E93', '#025645']);

    // Draw funnel stages
    stages.forEach((stage, i) => {
      const widthRatio = stage.value / maxValue;
      const stageWidth = minWidth + (maxFunnelWidth - minWidth) * widthRatio;
      const nextWidthRatio = stages[i + 1] ? stages[i + 1].value / maxValue : widthRatio * 0.8;
      const nextStageWidth = minWidth + (maxFunnelWidth - minWidth) * nextWidthRatio;

      const y = funnelStartY + i * stageHeight;

      // Create trapezoid path
      const path = d3.path();
      path.moveTo(centerX - stageWidth / 2, y);
      path.lineTo(centerX + stageWidth / 2, y);
      path.lineTo(centerX + nextStageWidth / 2, y + stageHeight);
      path.lineTo(centerX - nextStageWidth / 2, y + stageHeight);
      path.closePath();

      // Draw stage
      g.append('path')
        .attr('d', path.toString())
        .attr('fill', colorScale(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 0.85);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
        });

      // Stage label (left side - left aligned, text starts from left edge)
      g.append('text')
        .attr('x', -margin.left + 10)
        .attr('y', y + stageHeight / 2)
        .attr('text-anchor', 'start')
        .attr('dy', '0.35em')
        .style('font-size', '11px')
        .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
        .style('font-weight', '500')
        .style('fill', '#333')
        .text(stage.name);

      // Value and percentage (center)
      g.append('text')
        .attr('x', centerX)
        .attr('y', y + stageHeight / 2 - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
        .style('font-weight', '600')
        .style('fill', 'white')
        .text(stage.value.toLocaleString());

      // Conversion rate
      const convRate = ((stage.value / maxValue) * 100).toFixed(1);
      g.append('text')
        .attr('x', centerX)
        .attr('y', y + stageHeight / 2 + 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
        .style('fill', 'rgba(255,255,255,0.9)')
        .text(`${convRate}%`);

      // Drop-off indicator (right side - right aligned to card edge with padding)
      if (i > 0) {
        const dropOff = stages[i - 1].value - stage.value;
        const dropOffPct = ((dropOff / stages[i - 1].value) * 100).toFixed(1);

        g.append('text')
          .attr('x', innerWidth + margin.right - 10)
          .attr('y', y + stageHeight / 2)
          .attr('text-anchor', 'end')
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .style('fill', '#BF0404')
          .text(`-${dropOff.toLocaleString()} (${dropOffPct}%)`);
      }
    });

  }, [selectedSource, headless, handleSourceSelect]);

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
    <div className={`sales-funnel ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <div className="header-left">
          <h3 className="chart-title">Sales Funnel</h3>
          {!headless && <p className="chart-subtitle">Lead journey from request to invoice — click a source to filter</p>}
        </div>
        {!headless && selectedSource && (
          <button className="clear-filter-btn" onClick={() => handleSourceSelect(null)}>
            Clear Filter
          </button>
        )}
      </div>

      {/* HTML Legend for better layout control */}
      <div className="funnel-legend">
        {salesFunnelBySource.map((source) => (
          <button
            key={source.source}
            className={`legend-item ${selectedSource === source.source ? 'selected' : ''} ${selectedSource && selectedSource !== source.source ? 'dimmed' : ''}`}
            onClick={() => handleSourceSelect(selectedSource === source.source ? null : source.source)}
          >
            <span
              className="legend-dot"
              style={{ backgroundColor: LEAD_SOURCE_COLORS[source.source] || '#999' }}
            />
            <span className="legend-text">{source.source} ({source.requests.toLocaleString()})</span>
          </button>
        ))}
      </div>

      <div className="chart-area" />
      {headless && selectedSource && (
        <button className="clear-filter-btn headless-clear" onClick={() => handleSourceSelect(null)}>
          Clear Filter
        </button>
      )}
    </div>
  );
}

export default SalesFunnel;
