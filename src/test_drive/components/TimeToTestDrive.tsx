import { useCallback, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { timeToTestDriveData } from '../data/mockData';
import { UAEMap } from './UAEMap';
import type { GlobalFilters } from './FilterBar';
import './TimeToTestDrive.css';

interface TimeToTestDriveProps {
  filters?: GlobalFilters;
  headless?: boolean;
  useMapV1?: boolean; // Set to true to use old D3 map
}

// ============================================
// MAP V1 - OLD D3 IMPLEMENTATION (HIDDEN)
// Keep for reference, can be enabled with useMapV1 prop
// ============================================
/*
import { UAE_SHOWROOMS_DATA } from '../data/mockData';

const uaeGeoJson_v1 = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { name: "UAE" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [51.58, 24.08], [51.57, 24.25], [51.52, 24.29], [51.44, 24.44],
        [51.59, 24.59], [51.61, 24.75], [51.76, 24.75], [51.84, 24.64],
        [52.00, 24.47], [52.25, 24.15], [52.58, 24.13], [53.05, 24.09],
        [53.52, 24.09], [53.82, 24.15], [54.15, 24.22], [54.35, 24.36],
        [54.50, 24.41], [54.68, 24.49], [54.99, 24.70], [55.13, 24.81],
        [55.20, 25.02], [55.30, 25.22], [55.38, 25.28], [55.43, 25.35],
        [55.52, 25.38], [55.62, 25.43], [55.78, 25.52],
        [55.95, 25.60], [56.03, 25.68], [56.10, 25.78],
        [56.18, 25.92], [56.25, 26.04], [56.36, 26.07],
        [56.38, 25.88], [56.36, 25.72], [56.35, 25.50], [56.33, 25.32],
        [56.28, 25.18], [56.22, 25.08], [56.10, 24.92],
        [56.05, 24.78], [56.00, 24.63], [55.92, 24.48],
        [55.80, 24.24], [55.50, 24.18], [55.20, 24.05], [55.00, 23.95],
        [54.75, 23.85], [54.50, 23.80], [54.20, 23.70], [53.90, 23.62],
        [53.50, 23.55], [53.10, 23.48], [52.70, 23.42], [52.30, 23.52],
        [52.00, 23.75], [51.80, 24.00], [51.58, 24.08]
      ]]
    }
  }]
};

// D3 map rendering function (v1) - not used by default
const renderMapV1 = (containerRef, setHoveredShowroom) => {
  // ... old D3 implementation kept for reference
};
*/
// ============================================

export function TimeToTestDrive({ filters: _filters, headless = false, useMapV1 = false }: TimeToTestDriveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredShowroom, setHoveredShowroom] = useState<string | null>(null);
  const [selectedShowroom, setSelectedShowroom] = useState<string | null>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get actual dimensions from container for responsive sizing
    const containerWidth = chartArea.clientWidth || 600;
    const containerHeight = chartArea.clientHeight || 280;
    const margin = { top: 30, right: 60, bottom: 40, left: 120 };
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Sort by average days
    const sortedData = [...timeToTestDriveData].sort((a, b) => a.avgDays - b.avgDays);

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
      .domain(sortedData.map(d => d.showroom))
      .range([0, innerHeight])
      .padding(0.4);

    const xScale = d3.scaleLinear()
      .domain([0, Math.max(...sortedData.map(d => d.maxDays)) + 1])
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

    // Range lines
    g.selectAll('.range-line')
      .data(sortedData)
      .enter()
      .append('line')
      .attr('class', 'range-line')
      .attr('x1', d => xScale(d.minDays))
      .attr('x2', d => xScale(d.maxDays))
      .attr('y1', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('y2', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Min dots
    g.selectAll('.min-dot')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'min-dot')
      .attr('cx', d => xScale(d.minDays))
      .attr('cy', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('r', 5)
      .attr('fill', '#34a853');

    // Max dots
    g.selectAll('.max-dot')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'max-dot')
      .attr('cx', d => xScale(d.maxDays))
      .attr('cy', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('r', 5)
      .attr('fill', '#ea4335');

    // Average dots (larger)
    g.selectAll('.avg-dot')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'avg-dot')
      .attr('cx', d => xScale(d.avgDays))
      .attr('cy', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2)
      .attr('r', 8)
      .attr('fill', '#4285f4')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Average labels
    g.selectAll('.avg-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'avg-label')
      .attr('x', d => xScale(d.avgDays))
      .attr('y', d => (yScale(d.showroom) || 0) + yScale.bandwidth() / 2 - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#4285f4')
      .text(d => `${d.avgDays}d`);

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
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}d`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // X-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Days from Lead to Test Drive');

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

  // Highlight effect when hovering or selecting on map
  useEffect(() => {
    if (!containerRef.current) return;
    const chartArea = containerRef.current.querySelector('.chart-area');
    if (!chartArea) return;

    const svg = chartArea.querySelector('svg');
    if (!svg) return;

    // Determine which showroom to highlight (hover takes precedence, then selected)
    const activeShowroom = hoveredShowroom || selectedShowroom;

    // Update Y-axis labels
    const yAxisLabels = svg.querySelectorAll('.y-axis text');
    yAxisLabels.forEach((label) => {
      if (activeShowroom && label.textContent === activeShowroom) {
        (label as SVGTextElement).style.fontWeight = '700';
        (label as SVGTextElement).style.fill = '#4285f4';
      } else if (selectedShowroom && label.textContent === selectedShowroom && !hoveredShowroom) {
        (label as SVGTextElement).style.fontWeight = '700';
        (label as SVGTextElement).style.fill = '#4285f4';
      } else {
        (label as SVGTextElement).style.fontWeight = '400';
        (label as SVGTextElement).style.fill = selectedShowroom && !hoveredShowroom ? '#ccc' : '#666';
      }
    });

    // Update range lines opacity
    const rangeLines = svg.querySelectorAll('.range-line');
    rangeLines.forEach((line) => {
      const lineData = d3.select(line).datum() as { showroom: string } | undefined;
      if (lineData) {
        if (activeShowroom) {
          (line as SVGLineElement).style.opacity = lineData.showroom === activeShowroom ? '1' : '0.2';
          (line as SVGLineElement).style.strokeWidth = lineData.showroom === activeShowroom ? '4' : '2';
        } else {
          (line as SVGLineElement).style.opacity = '1';
          (line as SVGLineElement).style.strokeWidth = '2';
        }
      }
    });

    // Update dots opacity
    const allDots = svg.querySelectorAll('.min-dot, .max-dot, .avg-dot');
    allDots.forEach((dot) => {
      const dotData = d3.select(dot).datum() as { showroom: string } | undefined;
      if (dotData) {
        if (activeShowroom) {
          (dot as SVGCircleElement).style.opacity = dotData.showroom === activeShowroom ? '1' : '0.2';
          if (dotData.showroom === activeShowroom && dot.classList.contains('avg-dot')) {
            (dot as SVGCircleElement).setAttribute('r', '10');
          } else if (dot.classList.contains('avg-dot')) {
            (dot as SVGCircleElement).setAttribute('r', '8');
          }
        } else {
          (dot as SVGCircleElement).style.opacity = '1';
          if (dot.classList.contains('avg-dot')) {
            (dot as SVGCircleElement).setAttribute('r', '8');
          }
        }
      }
    });

    // Update avg labels opacity
    const avgLabels = svg.querySelectorAll('.avg-label');
    avgLabels.forEach((label) => {
      const labelData = d3.select(label).datum() as { showroom: string } | undefined;
      if (labelData) {
        if (activeShowroom) {
          (label as SVGTextElement).style.opacity = labelData.showroom === activeShowroom ? '1' : '0.2';
        } else {
          (label as SVGTextElement).style.opacity = '1';
        }
      }
    });
  }, [hoveredShowroom, selectedShowroom]);

  // Handler for MapLibre map hover events
  const handleMapHover = useCallback((showroomName: string | null) => {
    setHoveredShowroom(showroomName);
  }, []);

  // Handler for MapLibre map click events - toggle selection
  const handleMapClick = useCallback((_id: string, name: string) => {
    setSelectedShowroom(prev => prev === name ? null : name);
  }, []);

  return (
    <div className={`time-to-test-drive ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Time to Test Drive</h3>
        {!headless && <p className="chart-subtitle">Average days from lead assignment to completed test drive by showroom</p>}
      </div>

      {!headless && (
        <div className="legend-inline">
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#34a853' }} />
            Min
          </span>
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#4285f4' }} />
            Average
          </span>
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#ea4335' }} />
            Max
          </span>
        </div>
      )}

      <div className="chart-content">
        {/* Old D3 map (map_v1) - hidden by default */}
        {useMapV1 && <div className="map-area map-v1" />}

        {/* New MapLibre map */}
        {!useMapV1 && (
          <div className="map-area">
            <UAEMap
              onShowroomHover={handleMapHover}
              onShowroomClick={handleMapClick}
              selectedShowroom={selectedShowroom || hoveredShowroom}
            />
          </div>
        )}

        <div className="chart-area" />
      </div>
    </div>
  );
}

export default TimeToTestDrive;
