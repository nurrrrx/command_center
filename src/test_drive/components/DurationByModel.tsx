import { useCallback, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { durationByModelData } from '../data/mockData';
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

// Category colors - Priority palette
const CATEGORY_COLORS: Record<string, string> = {
  'SUV': '#051C2A',
  'Sedan': '#163E93',
  'Performance': '#30A3DA',
};

const CATEGORIES = ['SUV', 'Sedan', 'Performance'] as const;
type Category = typeof CATEGORIES[number];

const CHART_TYPES = ['dotplot', 'boxplot', 'violin'] as const;
type ChartType = typeof CHART_TYPES[number];

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  'dotplot': 'Dot Plot',
  'boxplot': 'Box Plot',
  'violin': 'Violin Plot',
};

interface DurationByModelProps {
  filters?: GlobalFilters;
  headless?: boolean;
}

export function DurationByModel({ filters: _filters, headless = false }: DurationByModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [chartType, setChartType] = useState<ChartType>('dotplot');
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderChart = useCallback((activeCategory: Category | null, type: ChartType) => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get actual dimensions from container for responsive sizing
    const containerWidth = chartArea.clientWidth || 600;
    const containerHeight = chartArea.clientHeight || 450;
    const imageSize = 90; // Larger size for car model images
    const margin = { top: 5, right: 30, bottom: 20, left: 140 }; // Left margin for chart positioning
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Group by category and sort within each category by avgDuration
    const groupedData = CATEGORIES.flatMap(category =>
      durationByModelData
        .filter(d => d.type === category)
        .sort((a, b) => b.avgDuration - a.avgDuration)
    );

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
      .domain(groupedData.map(d => d.model))
      .range([0, innerHeight])
      .padding(0.35);

    const xScale = d3.scaleLinear()
      .domain([0, 70])
      .range([0, innerWidth]);

    // Grid lines
    const ticks = [0, 10, 20, 30, 40, 50, 60];
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

    // Helper function to determine opacity based on selection
    const getOpacity = (type: string) => {
      if (!activeCategory) return 1;
      return type === activeCategory ? 1 : 0.15;
    };

    // Render based on chart type
    if (type === 'dotplot') {
      // Range lines - colored by category
      g.selectAll('.range-line')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'range-line')
        .attr('x1', d => xScale(d.minDuration))
        .attr('x2', d => xScale(d.maxDuration))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#ccc')
        .attr('stroke-width', 2)
        .attr('opacity', d => getOpacity(d.type));

      // Min dots
      g.selectAll('.min-dot')
        .data(groupedData)
        .enter()
        .append('circle')
        .attr('class', 'min-dot')
        .attr('cx', d => xScale(d.minDuration))
        .attr('cy', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('r', 4)
        .attr('fill', d => CATEGORY_COLORS[d.type] || '#999')
        .attr('opacity', d => getOpacity(d.type) * 0.6);

      // Max dots
      g.selectAll('.max-dot')
        .data(groupedData)
        .enter()
        .append('circle')
        .attr('class', 'max-dot')
        .attr('cx', d => xScale(d.maxDuration))
        .attr('cy', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('r', 4)
        .attr('fill', d => CATEGORY_COLORS[d.type] || '#999')
        .attr('opacity', d => getOpacity(d.type) * 0.6);

      // Average dots - colored by category
      g.selectAll('.avg-dot')
        .data(groupedData)
        .enter()
        .append('circle')
        .attr('class', 'avg-dot')
        .attr('cx', d => xScale(d.avgDuration))
        .attr('cy', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('r', 7)
        .attr('fill', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('opacity', d => getOpacity(d.type));

      // Average labels
      g.selectAll('.avg-label')
        .data(groupedData)
        .enter()
        .append('text')
        .attr('class', 'avg-label')
        .attr('x', d => xScale(d.avgDuration))
        .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - 12)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .style('opacity', d => getOpacity(d.type))
        .text(d => `${d.avgDuration}m`);
    } else if (type === 'boxplot') {
      const boxHeight = Math.min(yScale.bandwidth() * 0.6, 16);

      // Box (IQR range - using min to max as approximation)
      g.selectAll('.box')
        .data(groupedData)
        .enter()
        .append('rect')
        .attr('class', 'box')
        .attr('x', d => xScale(d.minDuration + (d.avgDuration - d.minDuration) * 0.5))
        .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - boxHeight / 2)
        .attr('width', d => xScale(d.maxDuration - (d.maxDuration - d.avgDuration) * 0.5) - xScale(d.minDuration + (d.avgDuration - d.minDuration) * 0.5))
        .attr('height', boxHeight)
        .attr('fill', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .attr('fill-opacity', d => getOpacity(d.type) * 0.3)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', d => getOpacity(d.type))
        .attr('rx', 2);

      // Whisker lines (min to Q1, Q3 to max)
      g.selectAll('.whisker-left')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'whisker-left')
        .attr('x1', d => xScale(d.minDuration))
        .attr('x2', d => xScale(d.minDuration + (d.avgDuration - d.minDuration) * 0.5))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#ccc')
        .attr('stroke-width', 1.5)
        .attr('opacity', d => getOpacity(d.type));

      g.selectAll('.whisker-right')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'whisker-right')
        .attr('x1', d => xScale(d.maxDuration - (d.maxDuration - d.avgDuration) * 0.5))
        .attr('x2', d => xScale(d.maxDuration))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#ccc')
        .attr('stroke-width', 1.5)
        .attr('opacity', d => getOpacity(d.type));

      // Whisker caps
      g.selectAll('.cap-left')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'cap-left')
        .attr('x1', d => xScale(d.minDuration))
        .attr('x2', d => xScale(d.minDuration))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - boxHeight / 3)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 + boxHeight / 3)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#ccc')
        .attr('stroke-width', 1.5)
        .attr('opacity', d => getOpacity(d.type));

      g.selectAll('.cap-right')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'cap-right')
        .attr('x1', d => xScale(d.maxDuration))
        .attr('x2', d => xScale(d.maxDuration))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - boxHeight / 3)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 + boxHeight / 3)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#ccc')
        .attr('stroke-width', 1.5)
        .attr('opacity', d => getOpacity(d.type));

      // Median line (using avg as median approximation)
      g.selectAll('.median')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'median')
        .attr('x1', d => xScale(d.avgDuration))
        .attr('x2', d => xScale(d.avgDuration))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - boxHeight / 2)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 + boxHeight / 2)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .attr('stroke-width', 2)
        .attr('opacity', d => getOpacity(d.type));

      // Average labels
      g.selectAll('.avg-label')
        .data(groupedData)
        .enter()
        .append('text')
        .attr('class', 'avg-label')
        .attr('x', d => xScale(d.avgDuration))
        .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - boxHeight / 2 - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .style('opacity', d => getOpacity(d.type))
        .text(d => `${d.avgDuration}m`);
    } else if (type === 'violin') {
      const violinHeight = Math.min(yScale.bandwidth() * 0.7, 18);

      // Violin shape (simplified as a symmetrical area)
      groupedData.forEach(d => {
        const centerY = (yScale(d.model) || 0) + yScale.bandwidth() / 2;
        const minX = xScale(d.minDuration);
        const maxX = xScale(d.maxDuration);
        const avgX = xScale(d.avgDuration);

        // Create violin path points
        const points = [
          [minX, centerY],
          [minX + (avgX - minX) * 0.3, centerY - violinHeight * 0.3],
          [avgX, centerY - violinHeight / 2],
          [avgX + (maxX - avgX) * 0.7, centerY - violinHeight * 0.3],
          [maxX, centerY],
          [avgX + (maxX - avgX) * 0.7, centerY + violinHeight * 0.3],
          [avgX, centerY + violinHeight / 2],
          [minX + (avgX - minX) * 0.3, centerY + violinHeight * 0.3],
          [minX, centerY],
        ];

        const lineGenerator = d3.line()
          .x(p => p[0])
          .y(p => p[1])
          .curve(d3.curveCatmullRom);

        g.append('path')
          .attr('class', 'violin')
          .attr('d', lineGenerator(points as [number, number][]))
          .attr('fill', CATEGORY_COLORS[d.type] || '#4285f4')
          .attr('fill-opacity', getOpacity(d.type) * 0.3)
          .attr('stroke', CATEGORY_COLORS[d.type] || '#4285f4')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', getOpacity(d.type));
      });

      // Median line inside violin
      g.selectAll('.median')
        .data(groupedData)
        .enter()
        .append('line')
        .attr('class', 'median')
        .attr('x1', d => xScale(d.avgDuration))
        .attr('x2', d => xScale(d.avgDuration))
        .attr('y1', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - violinHeight / 2 + 2)
        .attr('y2', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 + violinHeight / 2 - 2)
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .attr('stroke-width', 2)
        .attr('opacity', d => getOpacity(d.type));

      // Median dot
      g.selectAll('.median-dot')
        .data(groupedData)
        .enter()
        .append('circle')
        .attr('class', 'median-dot')
        .attr('cx', d => xScale(d.avgDuration))
        .attr('cy', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2)
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('stroke', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .attr('stroke-width', 1.5)
        .attr('opacity', d => getOpacity(d.type));

      // Average labels
      g.selectAll('.avg-label')
        .data(groupedData)
        .enter()
        .append('text')
        .attr('class', 'avg-label')
        .attr('x', d => xScale(d.avgDuration))
        .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - violinHeight / 2 - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', d => CATEGORY_COLORS[d.type] || '#4285f4')
        .style('opacity', d => getOpacity(d.type))
        .text(d => `${d.avgDuration}m`);
    }

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(35)) // Reduced padding between labels and images
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '11px')
      .style('opacity', function() {
        const model = d3.select(this).text();
        const modelData = groupedData.find(d => d.model === model);
        return modelData ? getOpacity(modelData.type) : 1;
      });

    // Add car model images next to Y-axis labels
    g.selectAll('.model-image')
      .data(groupedData)
      .enter()
      .append('image')
      .attr('class', 'model-image')
      .attr('x', -30) // Position to the right of the model name
      .attr('y', d => (yScale(d.model) || 0) + yScale.bandwidth() / 2 - imageSize / 2)
      .attr('width', imageSize)
      .attr('height', imageSize)
      .attr('href', d => MODEL_IMAGES[d.model] || '')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('opacity', d => getOpacity(d.type));

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(ticks).tickFormat(d => `${d}`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // X-axis label at end (right-aligned to chart edge)
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth + margin.right - 5)
      .attr('y', innerHeight + 15)
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#999')
      .text('(duration, min)');

  }, []);

  useEffect(() => {
    // Delay initial render to ensure container is properly sized
    const timeoutId = setTimeout(() => {
      renderChart(selectedCategory, chartType);
    }, 50);

    // Re-render chart on container resize
    const chartArea = containerRef.current?.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const resizeObserver = new ResizeObserver(() => {
      renderChart(selectedCategory, chartType);
    });
    resizeObserver.observe(chartArea);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [renderChart, selectedCategory, chartType]);

  // Handle category click - toggle selection
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  // Handle chart type change
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    setMenuOpen(false);
  };

  return (
    <div className={`duration-by-model ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drive Duration by Model</h3>
        {!headless && <p className="chart-subtitle">Average test drive duration per vehicle model</p>}

        {/* Chart type menu */}
        <div className="chart-menu" ref={menuRef}>
          <button
            className="menu-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Chart options"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <div className="menu-label">Chart Type</div>
              {CHART_TYPES.map(type => (
                <button
                  key={type}
                  className={`menu-item ${chartType === type ? 'active' : ''}`}
                  onClick={() => handleChartTypeChange(type)}
                >
                  {CHART_TYPE_LABELS[type]}
                  {chartType === type && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M11.5 3.5L5.5 9.5L2.5 6.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="legend-inline">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`legend-item legend-button ${selectedCategory === category ? 'active' : ''} ${selectedCategory && selectedCategory !== category ? 'dimmed' : ''}`}
            onClick={() => handleCategoryClick(category)}
            style={{ color: CATEGORY_COLORS[category] }}
          >
            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
            {category}
          </button>
        ))}
      </div>

      <div className="chart-area" />
    </div>
  );
}

export default DurationByModel;
