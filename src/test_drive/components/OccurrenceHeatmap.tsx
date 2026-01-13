import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { occurrenceByModelData } from '../data/mockData';
import type { GlobalFilters } from './FilterBar';
import './OccurrenceHeatmap.css';

interface OccurrenceModelData {
  model: string;
  booked: number;
  firstShow: number;
  rescheduled: number;
  cancelled: number;
  noShow: number;
}

interface OccurrenceHeatmapProps {
  filters?: GlobalFilters;
}

export function OccurrenceHeatmap({ filters: _filters }: OccurrenceHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [normalized, setNormalized] = useState(false);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    // Clear previous
    d3.select(chartArea).selectAll('*').remove();

    const data = occurrenceByModelData as OccurrenceModelData[];

    // Get container dimensions dynamically
    const containerWidth = chartArea.clientWidth || 700;
    const containerHeight = chartArea.clientHeight || 400;

    // Dimensions - left margin for car images and names
    // Minimal right margin to use full width
    const margin = { top: 105, right: 10, bottom: 10, left: 150 };
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Categories - negative (left) and positive (right)
    // Order from left to right: No-Show, Cancelled, Rescheduled, Completed
    // Note: negativeCategories is reversed so that when drawing left from 0,
    // cancelled is closest to 0 and noShow is furthest left
    const negativeCategories = ['cancelled', 'noShow'] as const;
    const positiveCategories = ['rescheduled', 'completed'] as const;
    const allCategories = ['noShow', 'cancelled', 'rescheduled', 'completed'] as const;

    const categoryLabels: Record<string, string> = {
      completed: 'Completed',
      rescheduled: 'Rescheduled',
      cancelled: 'Cancelled',
      noShow: 'No-Show'
    };

    // Colors: No-Show (Bain red), Cancelled (BCG gold), Rescheduled (McKinsey blue), Completed (BCG green)
    const categoryColors: Record<string, string> = {
      noShow: '#BF0404',      // Bain red
      cancelled: '#E6B437',   // BCG gold
      rescheduled: '#30A3DA', // McKinsey light blue
      completed: '#025645'    // BCG green
    };

    // Model image mapping - convert model name to image filename
    const getModelImageUrl = (model: string): string => {
      const filename = model
        .toLowerCase()
        .replace(/\s+/g, '')  // Remove spaces
        .replace('convertible', 'convertible');  // Keep convertible suffix

      // Check for avif files first (some models use avif)
      const avifModels = ['is300', 'nx350', 'nx350h', 'rc350', 'lc500convertible'];
      const extension = avifModels.includes(filename) ? 'avif' : 'png';

      return `/models/${filename}.${extension}`;
    };

    // Helper function to determine if a color is light (needs dark text)
    const isLightColor = (color: string): boolean => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.6;
    };

    // Process data for stacking
    interface ProcessedValue {
      category: string;
      value: number;
      start: number;
      end: number;
      percentage: number;
    }

    interface ProcessedItem {
      name: string;
      values: ProcessedValue[];
      total: number;
      positiveTotal: number;
      negativeTotal: number;
    }

    const processedData: ProcessedItem[] = data.map(d => {
      // Map firstShow to completed
      const completed = d.firstShow;
      const positiveSum = completed + d.rescheduled;
      const negativeSum = d.cancelled + d.noShow;
      const total = positiveSum + negativeSum;

      // Create a data map for easy access
      const dataMap: Record<string, number> = {
        noShow: d.noShow,
        cancelled: d.cancelled,
        rescheduled: d.rescheduled,
        completed: completed
      };

      const values: ProcessedValue[] = [];

      // Process negative categories (going left from 0)
      let negativeStart = 0;
      negativeCategories.forEach(cat => {
        const rawValue = dataMap[cat];
        const pct = total > 0 ? rawValue / total : 0;
        if (normalized) {
          values.push({
            category: cat,
            value: rawValue,
            start: negativeStart - pct,
            end: negativeStart,
            percentage: pct
          });
          negativeStart -= pct;
        } else {
          values.push({
            category: cat,
            value: rawValue,
            start: negativeStart - rawValue,
            end: negativeStart,
            percentage: pct
          });
          negativeStart -= rawValue;
        }
      });

      // Process positive categories (going right from 0)
      let positiveStart = 0;
      positiveCategories.forEach(cat => {
        const rawValue = dataMap[cat];
        const pct = total > 0 ? rawValue / total : 0;
        if (normalized) {
          values.push({
            category: cat,
            value: rawValue,
            start: positiveStart,
            end: positiveStart + pct,
            percentage: pct
          });
          positiveStart += pct;
        } else {
          values.push({
            category: cat,
            value: rawValue,
            start: positiveStart,
            end: positiveStart + rawValue,
            percentage: pct
          });
          positiveStart += rawValue;
        }
      });

      return {
        name: d.model,
        values,
        total,
        positiveTotal: positiveSum,
        negativeTotal: negativeSum
      };
    });

    // Calculate x domain
    let xDomain: [number, number];
    if (normalized) {
      // Find the max negative and positive percentages
      const maxNeg = d3.min(processedData, d =>
        d3.min(d.values.filter(v => v.start < 0), v => v.start)
      ) || -0.5;
      const maxPos = d3.max(processedData, d =>
        d3.max(d.values.filter(v => v.end > 0), v => v.end)
      ) || 0.5;
      xDomain = [maxNeg, maxPos];
    } else {
      const maxPositive = d3.max(processedData, d => d.positiveTotal) || 0;
      const minNegative = d3.min(processedData, d => -d.negativeTotal) || 0;
      xDomain = [minNegative, maxPositive];
    }

    // Create scales - no .nice() to use full width without padding
    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(processedData.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.2);

    // Create SVG
    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font', '10px sans-serif');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create tooltip
    const tooltip = d3.select(chartArea)
      .append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0);

    // Add title (top left)
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', 10)
      .attr('y', 20)
      .style('font-size', '14px')
      .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .style('font-weight', '600')
      .style('fill', '#1a1a1a')
      .text('Test Drive Attendance');

    // Add horizontal legend centered under title
    // First calculate total legend width
    let totalLegendWidth = 0;
    const legendItemWidths: number[] = [];

    // Create temporary text elements to measure widths
    allCategories.forEach((cat) => {
      const tempText = svg.append('text')
        .style('font-size', '11px')
        .text(categoryLabels[cat]);
      const textWidth = (tempText.node() as SVGTextElement).getComputedTextLength();
      tempText.remove();
      const itemWidth = 12 + 4 + textWidth + 16; // rect + gap + text + spacing
      legendItemWidths.push(itemWidth);
      totalLegendWidth += itemWidth;
    });
    totalLegendWidth -= 16; // Remove last spacing

    // Center the legend horizontally
    const legendX = (width - totalLegendWidth) / 2;
    const legendG = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, 38)`);

    let xOffset = 0;
    allCategories.forEach((cat, index) => {
      const legendItem = legendG.append('g')
        .attr('transform', `translate(${xOffset}, 0)`);

      legendItem.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', categoryColors[cat]);

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .style('font-size', '11px')
        .style('fill', '#333')
        .text(categoryLabels[cat]);

      xOffset += legendItemWidths[index];
    });

    // Draw stacked bars
    processedData.forEach(item => {
      const barGroup = g.append('g').attr('class', 'bar-group');

      item.values.forEach(v => {
        const x1 = xScale(v.start);
        const x2 = xScale(v.end);
        const barWidth = Math.abs(x2 - x1);

        barGroup.append('rect')
          .attr('class', 'bar')
          .attr('x', Math.min(x1, x2))
          .attr('y', yScale(item.name) || 0)
          .attr('width', barWidth)
          .attr('height', yScale.bandwidth())
          .attr('fill', categoryColors[v.category])
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            d3.select(this).attr('opacity', 0.8);
            const pctStr = (v.percentage * 100).toFixed(1) + '%';
            tooltip
              .style('opacity', 1)
              .html(`
                <strong>${item.name}</strong><br/>
                ${categoryLabels[v.category]}: ${v.value}<br/>
                ${pctStr} of total
              `)
              .style('left', `${event.offsetX + 15}px`)
              .style('top', `${event.offsetY - 10}px`);
          })
          .on('mousemove', function(event) {
            tooltip
              .style('left', `${event.offsetX + 15}px`)
              .style('top', `${event.offsetY - 10}px`);
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
            tooltip.style('opacity', 0);
          });

        // Add value labels on bars if wide enough
        if (barWidth > 25) {
          const barColor = categoryColors[v.category];
          const textColor = isLightColor(barColor) ? '#333' : 'white';
          // Show percentage when normalized, actual value otherwise
          const labelText = normalized
            ? `${Math.round(v.percentage * 100)}%`
            : v.value.toString();

          barGroup.append('text')
            .attr('class', 'bar-label')
            .attr('x', Math.min(x1, x2) + barWidth / 2)
            .attr('y', (yScale(item.name) || 0) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', textColor)
            .style('pointer-events', 'none')
            .text(labelText);
        }
      });
    });

    // Add x-axis at top with gap from bars
    const axisOffset = -8; // Reduced gap between axis and first bar
    const xAxis = normalized
      ? d3.axisTop(xScale).tickFormat(d => `${Math.abs((d as number) * 100)}%`)
      : d3.axisTop(xScale).tickFormat(d => Math.abs(d as number).toString());

    g.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${axisOffset})`)
      .call(xAxis)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#000').attr('y2', 6));

    // Add axis annotation labels with arrows (like PolitiFact style)
    const zeroX = xScale(0);
    g.append('text')
      .attr('class', 'axis-annotation')
      .attr('x', zeroX - 10)
      .attr('y', axisOffset - 22) // More padding above axis
      .attr('text-anchor', 'end')
      .style('font-size', '11px')
      .style('fill', '#666')
      .text('\u2190 More no-shows');

    g.append('text')
      .attr('class', 'axis-annotation')
      .attr('x', zeroX + 10)
      .attr('y', axisOffset - 22) // More padding above axis
      .attr('text-anchor', 'start')
      .style('font-size', '11px')
      .style('fill', '#666')
      .text('More shows \u2192');

    // Add y-axis labels with car images
    // Larger image size
    const imageHeight = Math.min(yScale.bandwidth() * 1.3, 80);
    const imageWidth = imageHeight * 2.6; // Aspect ratio for car images

    // Calculate text width for positioning
    const textAreaWidth = 55; // Space reserved for model names on the left
    const imageStartX = textAreaWidth + 2;
    const leftPadding = 12; // Padding before car names

    processedData.forEach(d => {
      const yPos = margin.top + (yScale(d.name) || 0) + yScale.bandwidth() / 2;

      // Add model name text (positioned to the left of the car image)
      // Handle long names by wrapping to two lines
      const nameParts = d.name.split(' ');
      if (nameParts.length > 1 && d.name.length > 8) {
        // Wrap text to two lines
        svg.append('text')
          .attr('class', 'name-label')
          .attr('x', leftPadding + textAreaWidth)
          .attr('y', yPos - 6)
          .attr('text-anchor', 'end')
          .style('font-size', '11px')
          .style('fill', '#333')
          .text(nameParts[0]);
        svg.append('text')
          .attr('class', 'name-label')
          .attr('x', leftPadding + textAreaWidth)
          .attr('y', yPos + 6)
          .attr('text-anchor', 'end')
          .style('font-size', '11px')
          .style('fill', '#333')
          .text(nameParts.slice(1).join(' '));
      } else {
        svg.append('text')
          .attr('class', 'name-label')
          .attr('x', leftPadding + textAreaWidth)
          .attr('y', yPos)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .style('font-size', '11px')
          .style('fill', '#333')
          .text(d.name);
      }

      // Add car image (larger, to the right of the name)
      svg.append('image')
        .attr('class', 'model-image')
        .attr('href', getModelImageUrl(d.name))
        .attr('x', leftPadding + imageStartX)
        .attr('y', yPos - imageHeight / 2)
        .attr('width', imageWidth)
        .attr('height', imageHeight)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    });

    // Add zero line
    g.append('line')
      .attr('class', 'zero-line')
      .attr('x1', zeroX)
      .attr('x2', zeroX)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

  }, [normalized]);

  useEffect(() => {
    renderChart();

    // Add resize observer to re-render on container size change
    const chartArea = containerRef.current?.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });
    resizeObserver.observe(chartArea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [renderChart]);

  return (
    <div className="occurrence-heatmap" ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drive Occurrence Heatmap</h3>
        <div className="chart-toggle">
          <button
            className={`toggle-btn ${!normalized ? 'active' : ''}`}
            onClick={() => setNormalized(false)}
          >
            Actuals
          </button>
          <button
            className={`toggle-btn ${normalized ? 'active' : ''}`}
            onClick={() => setNormalized(true)}
          >
            Normalized
          </button>
        </div>
      </div>
      <div className="chart-area">
        {/* SVG rendered by D3 */}
      </div>
    </div>
  );
}

export default OccurrenceHeatmap;
