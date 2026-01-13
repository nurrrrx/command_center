import { useCallback, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './TestDrivesByModelVertical.css';

type VehicleType = 'SUV' | 'Sedan' | 'Performance' | null;
type MetricType = 'volume' | 'conversion';

interface ModelData {
  model: string;
  type: string;
  testDrives: number;
  conversionRate?: number; // Overall conversion rate for this model
  // Funnel data
  leads?: number;
  qualified?: number;
  booked?: number;
  performed?: number;
}

interface TestDrivesByModelVerticalProps {
  data: ModelData[];
  headless?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  SUV: '#051C2A',
  Sedan: '#163E93',
  Performance: '#30A3DA'
};

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

// Funnel stage colors - using McKinsey palette
const FUNNEL_COLORS = {
  leads: '#051C2A',
  qualified: '#163E93',
  booked: '#30A3DA',
  performed: '#337B68'
};

// Funnel stage display names
const FUNNEL_STAGE_NAMES: Record<string, string> = {
  leads: 'Leads',
  qualified: 'Qualified',
  booked: 'Booked',
  performed: 'Completed'
};

export function TestDrivesByModelVertical({ data, headless = false }: TestDrivesByModelVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<VehicleType>(null);
  const [metric, setMetric] = useState<MetricType>('volume');

  const handleTypeClick = (type: VehicleType) => {
    setSelectedType(prev => prev === type ? null : type);
  };

  const renderChart = useCallback((filterType: VehicleType, currentMetric: MetricType) => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get actual container dimensions for responsive sizing
    const containerWidth = chartArea.clientWidth || 800;
    const containerHeight = chartArea.clientHeight || 400;

    // 50% for bar chart, 50% for funnels
    const barChartHeight = containerHeight * 0.5;
    const funnelAreaHeight = containerHeight * 0.5;

    const margin = { top: 20, right: 10, bottom: 5, left: 70 };
    const width = containerWidth;
    const height = barChartHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Always sort by test drives (volume) to keep model order consistent
    // This ensures car images and names stay in the same position regardless of metric toggle
    const sortedData = [...data].sort((a, b) => b.testDrives - a.testDrives);

    // Get value for current metric
    const getValue = (d: ModelData) => {
      if (currentMetric === 'conversion') {
        return d.conversionRate ?? (d.performed || d.testDrives) / (d.leads || d.testDrives * 1.5) * 100;
      }
      return d.testDrives;
    };

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => d.model))
      .range([0, innerWidth])
      .padding(0.08); // Reduced padding for tighter bars

    const maxValue = Math.max(...sortedData.map(d => getValue(d)));
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '2,2');

    // Helper function to get opacity based on filter
    const getOpacity = (type: string) => {
      if (!filterType) return 1;
      return type === filterType ? 1 : 0.2;
    };

    // Bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.model) || 0)
      .attr('y', d => yScale(getValue(d)))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(getValue(d)))
      .attr('fill', d => TYPE_COLORS[d.type] || '#4285f4')
      .attr('opacity', d => getOpacity(d.type))
      .attr('rx', 2);

    // Value labels on top of bars
    g.selectAll('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => (xScale(d.model) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(getValue(d)) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#333')
      .style('font-weight', '500')
      .style('opacity', d => getOpacity(d.type))
      .text(d => currentMetric === 'conversion'
        ? `${getValue(d).toFixed(1)}%`
        : getValue(d).toLocaleString());

    // Mini-funnel area for each model (positioned in bottom 50%)
    const funnelStartY = barChartHeight - 15; // Move up closer to bar chart
    const funnelG = svg.append('g')
      .attr('class', 'mini-funnels')
      .attr('transform', `translate(${margin.left}, ${funnelStartY})`);

    // Calculate layout dimensions
    const funnelStages = ['leads', 'qualified', 'booked', 'performed'] as const;
    const imageSize = 90; // Large car image size
    const imageTopPadding = 0;
    const modelNameGap = 0; // Minimal gap between image and model name
    const modelNameHeight = 20; // Height for model name text + padding to funnel
    const headerHeight = imageTopPadding + imageSize + modelNameGap + modelNameHeight; // Image + gap + model name
    const availableFunnelHeight = funnelAreaHeight + 15 - headerHeight - 2; // Adjusted for moved start
    const funnelBarHeight = Math.floor((availableFunnelHeight - (funnelStages.length - 1) * 2) / funnelStages.length);
    const funnelBarGap = 2;

    sortedData.forEach(d => {
      const modelX = xScale(d.model) || 0;
      const barWidth = xScale.bandwidth();

      // Car image (centered, may overflow column slightly for large images)
      const imageX = modelX + (barWidth - imageSize) / 2;
      const modelOpacity = getOpacity(d.type);

      funnelG.append('image')
        .attr('class', 'model-image')
        .attr('x', imageX)
        .attr('y', imageTopPadding)
        .attr('width', imageSize)
        .attr('height', imageSize)
        .attr('href', MODEL_IMAGES[d.model] || '')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('opacity', modelOpacity);

      // Model name below image
      funnelG.append('text')
        .attr('class', 'model-label')
        .attr('x', modelX + barWidth / 2)
        .attr('y', imageTopPadding + imageSize + 2) // Minimal padding right under car
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('fill', '#333')
        .style('font-weight', '500')
        .style('opacity', modelOpacity)
        .text(d.model);

      // Get funnel values (use defaults if not provided)
      const leads = d.leads || d.testDrives * 1.5;
      const qualified = d.qualified || d.testDrives * 1.2;
      const booked = d.booked || d.testDrives * 1.1;
      const performed = d.performed || d.testDrives;

      const funnelValues = { leads, qualified, booked, performed };
      const maxFunnelValue = leads;

      // Create mini-funnel scale (relative to leads)
      const funnelScale = d3.scaleLinear()
        .domain([0, maxFunnelValue])
        .range([0, barWidth]);

      // Draw each funnel stage as left-aligned horizontal bar with value labels
      funnelStages.forEach((stage, i) => {
        const value = funnelValues[stage];
        const barWidthCalc = funnelScale(value);
        const yPos = headerHeight + i * (funnelBarHeight + funnelBarGap);

        // Left-align the bar within the column
        funnelG.append('rect')
          .attr('class', `funnel-bar funnel-${stage}`)
          .attr('x', modelX)
          .attr('y', yPos)
          .attr('width', barWidthCalc)
          .attr('height', funnelBarHeight)
          .attr('fill', FUNNEL_COLORS[stage])
          .attr('opacity', modelOpacity)
          .attr('rx', 2);

        // Add value label inside the funnel bar (left-aligned within the bar)
        const displayValue = currentMetric === 'conversion'
          ? `${((value / leads) * 100).toFixed(0)}%`
          : Math.round(value).toLocaleString();

        funnelG.append('text')
          .attr('class', 'funnel-value')
          .attr('x', modelX + 4)
          .attr('y', yPos + funnelBarHeight / 2 + 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#fff')
          .style('font-weight', '600')
          .style('opacity', modelOpacity)
          .text(displayValue);

      });
    });

    // Add stage name labels on the far left (only once, outside the model columns)
    funnelStages.forEach((stage, i) => {
      const yPos = headerHeight + i * (funnelBarHeight + funnelBarGap);
      funnelG.append('text')
        .attr('class', 'funnel-stage-label')
        .attr('x', -margin.left + 5) // Left-aligned at the edge of the chart area
        .attr('y', yPos + funnelBarHeight / 2 + 3)
        .attr('text-anchor', 'start')
        .style('font-size', '9px')
        .style('fill', '#666')
        .style('font-weight', '400')
        .text(FUNNEL_STAGE_NAMES[stage]);
    });

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d =>
        currentMetric === 'conversion' ? `${d}%` : d3.format(',')(d as number)
      ))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#666');

    // Y-axis label
    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(currentMetric === 'conversion' ? '% Converted' : 'Test Drives');

  }, [data]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderChart(selectedType, metric);
    }, 50);

    const chartArea = containerRef.current?.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const resizeObserver = new ResizeObserver(() => {
      renderChart(selectedType, metric);
    });
    resizeObserver.observe(chartArea);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [renderChart, selectedType, metric]);

  return (
    <div className={`test-drives-by-model-vertical ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Car Models Statistics</h3>
        <div className="chart-toggle">
          <button
            className={`toggle-btn ${metric === 'volume' ? 'active' : ''}`}
            onClick={() => setMetric('volume')}
          >
            Volume
          </button>
          <button
            className={`toggle-btn ${metric === 'conversion' ? 'active' : ''}`}
            onClick={() => setMetric('conversion')}
          >
            Conversion %
          </button>
        </div>
      </div>

      <div className="legend right-aligned">
        <button
          className={`legend-button ${selectedType === 'SUV' ? 'selected' : ''}`}
          onClick={() => handleTypeClick('SUV')}
        >
          <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS.SUV }} />
          <span className="legend-label">SUV</span>
        </button>
        <button
          className={`legend-button ${selectedType === 'Sedan' ? 'selected' : ''}`}
          onClick={() => handleTypeClick('Sedan')}
        >
          <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS.Sedan }} />
          <span className="legend-label">Sedan</span>
        </button>
        <button
          className={`legend-button ${selectedType === 'Performance' ? 'selected' : ''}`}
          onClick={() => handleTypeClick('Performance')}
        >
          <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS.Performance }} />
          <span className="legend-label">Performance</span>
        </button>
        <div className="legend-divider" />
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: FUNNEL_COLORS.leads }} />
          <span className="legend-label">Leads</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: FUNNEL_COLORS.qualified }} />
          <span className="legend-label">Qualified</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: FUNNEL_COLORS.booked }} />
          <span className="legend-label">Booked</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: FUNNEL_COLORS.performed }} />
          <span className="legend-label">Performed</span>
        </div>
      </div>

      <div className="chart-area" />
    </div>
  );
}

export default TestDrivesByModelVertical;
