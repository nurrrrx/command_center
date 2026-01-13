import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { testDriveRecords, filterRecords, type GlobalFilters } from '../data/mockData';
import { LiveTestDrives } from './LiveTestDrives';
import './TestDrivesOverTime.css';

type AggregationType = 'day' | 'week' | 'month' | 'year';

interface TestDrivesOverTimeProps {
  filters?: GlobalFilters;
}

export function TestDrivesOverTime({ filters }: TestDrivesOverTimeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aggregation, setAggregation] = useState<AggregationType>('month');
  const [showLive, setShowLive] = useState(false);

  const aggregatedData = useMemo(() => {
    const parseDate = d3.timeParse('%Y-%m-%d');

    // Apply all filters using the new filterRecords function
    const defaultFilters: GlobalFilters = {
      startDate: null,
      endDate: null,
      model: null,
      showroom: null,
      channel: null
    };
    const activeFilters = filters || defaultFilters;
    const filteredRecords = filterRecords(testDriveRecords, activeFilters);

    // Group by date and count
    const dateGroups = new Map<string, number>();
    filteredRecords.forEach(record => {
      const count = dateGroups.get(record.date) || 0;
      dateGroups.set(record.date, count + 1);
    });

    const dataWithDates = Array.from(dateGroups.entries()).map(([date, testDrives]) => ({
      date: parseDate(date)!,
      testDrives
    })).filter(d => d.date !== null);

    if (aggregation === 'day') {
      return dataWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    const grouped = d3.group(dataWithDates, d => {
      if (aggregation === 'year') {
        return d3.timeYear.floor(d.date);
      } else if (aggregation === 'month') {
        return d3.timeMonth.floor(d.date);
      } else {
        return d3.timeWeek.floor(d.date);
      }
    });

    return Array.from(grouped, ([date, values]) => ({
      date,
      testDrives: d3.sum(values, v => v.testDrives)
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [aggregation, filters]);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.historical-chart .chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Remove any existing tooltips
    const existingTooltip = chartArea.querySelector('.chart-tooltip');
    if (existingTooltip) existingTooltip.remove();

    // Get container dimensions for responsive sizing
    const containerWidth = chartArea.clientWidth || 800;
    const containerHeight = chartArea.clientHeight || 300;

    const margin = { top: 15, right: 20, bottom: 60, left: 60 };
    const width = containerWidth;
    const height = containerHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(aggregatedData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.testDrives) as number * 1.1])
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
      .attr('stroke', '#eee');

    // Area
    const area = d3.area<typeof aggregatedData[0]>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.testDrives))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(aggregatedData)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'rgba(5, 28, 42, 0.15)');

    // Line
    const line = d3.line<typeof aggregatedData[0]>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.testDrives))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(aggregatedData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#051C2A')
      .attr('stroke-width', 2);

    // Multi-level X-axis
    const xDomain = xScale.domain();

    if (aggregation === 'year') {
      // Year aggregation: just show years
      const xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeYear.every(1))
        .tickFormat(d => d3.timeFormat('%Y')(d as Date));

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '10px')
        .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
        .style('font-weight', '500');

    } else if (aggregation === 'month') {
      // Month aggregation: months on primary axis, years on secondary with more padding
      const dateRange = xDomain[1].getTime() - xDomain[0].getTime();
      const monthsInRange = dateRange / (30 * 24 * 60 * 60 * 1000);
      const monthInterval = monthsInRange > 24 ? 3 : monthsInRange > 12 ? 2 : 1;

      const monthAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(monthInterval))
        .tickFormat(d => d3.timeFormat('%b')(d as Date));

      g.append('g')
        .attr('class', 'x-axis x-axis-months')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(monthAxis)
        .call(g => g.select('.domain').remove())
        .selectAll('text')
        .style('font-size', '9px')
        .style('fill', '#666');

      // Year labels (secondary axis) - increased padding
      const years = d3.timeYears(xDomain[0], d3.timeYear.offset(xDomain[1], 1));
      const yearAxis = g.append('g')
        .attr('class', 'x-axis x-axis-years')
        .attr('transform', `translate(0, ${innerHeight + 35})`);

      years.forEach((year, i) => {
        const yearStart = Math.max(xScale(year), 0);
        const nextYear = years[i + 1] || xDomain[1];
        const yearEnd = Math.min(xScale(nextYear), innerWidth);
        const yearWidth = yearEnd - yearStart;

        if (yearWidth > 30) {
          yearAxis.append('text')
            .attr('x', yearStart + yearWidth / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', '600')
            .style('fill', '#333')
            .text(d3.timeFormat('%Y')(year));

          if (i > 0) {
            yearAxis.append('line')
              .attr('x1', yearStart)
              .attr('x2', yearStart)
              .attr('y1', -35)
              .attr('y2', 5)
              .attr('stroke', '#ccc')
              .attr('stroke-width', 1);
          }
        }
      });

    } else if (aggregation === 'week') {
      // Week aggregation: week numbers on primary, months on secondary, years on tertiary
      const dateRange = xDomain[1].getTime() - xDomain[0].getTime();
      const weeksInRange = dateRange / (7 * 24 * 60 * 60 * 1000);
      const weekInterval = weeksInRange > 52 ? 4 : weeksInRange > 24 ? 2 : 1;

      // Week number axis (W1, W2, etc.)
      const weekAxis = d3.axisBottom(xScale)
        .ticks(d3.timeWeek.every(weekInterval))
        .tickFormat(d => `W${d3.timeFormat('%W')(d as Date)}`);

      g.append('g')
        .attr('class', 'x-axis x-axis-weeks')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(weekAxis)
        .call(g => g.select('.domain').remove())
        .selectAll('text')
        .style('font-size', '8px')
        .style('fill', '#888');

      // Month labels (secondary axis) - increased padding from week numbers
      const months = d3.timeMonths(xDomain[0], d3.timeMonth.offset(xDomain[1], 1));
      const monthAxis = g.append('g')
        .attr('class', 'x-axis x-axis-months-secondary')
        .attr('transform', `translate(0, ${innerHeight + 28})`);

      months.forEach((month, i) => {
        const monthStart = Math.max(xScale(month), 0);
        const nextMonth = months[i + 1] || xDomain[1];
        const monthEnd = Math.min(xScale(nextMonth), innerWidth);
        const monthWidth = monthEnd - monthStart;

        if (monthWidth > 25) {
          monthAxis.append('text')
            .attr('x', monthStart + monthWidth / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '9px')
            .style('font-weight', '500')
            .style('fill', '#555')
            .text(d3.timeFormat('%b')(month));

          if (i > 0) {
            monthAxis.append('line')
              .attr('x1', monthStart)
              .attr('x2', monthStart)
              .attr('y1', -28)
              .attr('y2', 3)
              .attr('stroke', '#ddd')
              .attr('stroke-width', 1);
          }
        }
      });

      // Year labels (tertiary axis)
      const years = d3.timeYears(xDomain[0], d3.timeYear.offset(xDomain[1], 1));
      const yearAxis = g.append('g')
        .attr('class', 'x-axis x-axis-years')
        .attr('transform', `translate(0, ${innerHeight + 46})`);

      years.forEach((year, i) => {
        const yearStart = Math.max(xScale(year), 0);
        const nextYear = years[i + 1] || xDomain[1];
        const yearEnd = Math.min(xScale(nextYear), innerWidth);
        const yearWidth = yearEnd - yearStart;

        if (yearWidth > 40) {
          yearAxis.append('text')
            .attr('x', yearStart + yearWidth / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('font-weight', '600')
            .style('fill', '#333')
            .text(d3.timeFormat('%Y')(year));

          if (i > 0) {
            yearAxis.append('line')
              .attr('x1', yearStart)
              .attr('x2', yearStart)
              .attr('y1', -18)
              .attr('y2', 3)
              .attr('stroke', '#bbb')
              .attr('stroke-width', 1);
          }
        }
      });

    } else {
      // Day aggregation: days on primary, months on secondary, years on tertiary
      const dateRange = xDomain[1].getTime() - xDomain[0].getTime();
      const daysInRange = dateRange / (24 * 60 * 60 * 1000);
      const dayInterval = daysInRange > 90 ? 7 : daysInRange > 30 ? 3 : 1;

      const dayAxis = d3.axisBottom(xScale)
        .ticks(d3.timeDay.every(dayInterval))
        .tickFormat(d => d3.timeFormat('%d')(d as Date));

      g.append('g')
        .attr('class', 'x-axis x-axis-days')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(dayAxis)
        .call(g => g.select('.domain').remove())
        .selectAll('text')
        .style('font-size', '8px')
        .style('fill', '#888');

      // Month labels (secondary axis) - increased padding from days
      const months = d3.timeMonths(d3.timeMonth.floor(xDomain[0]), d3.timeMonth.offset(xDomain[1], 1));
      const monthAxis = g.append('g')
        .attr('class', 'x-axis x-axis-months-secondary')
        .attr('transform', `translate(0, ${innerHeight + 28})`);

      months.forEach((month, i) => {
        const monthStart = Math.max(xScale(month), 0);
        const nextMonth = months[i + 1] || xDomain[1];
        const monthEnd = Math.min(xScale(nextMonth), innerWidth);
        const monthWidth = monthEnd - monthStart;

        if (monthWidth > 20) {
          monthAxis.append('text')
            .attr('x', monthStart + monthWidth / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '9px')
            .style('font-weight', '500')
            .style('fill', '#555')
            .text(d3.timeFormat('%b')(month));

          if (i > 0) {
            monthAxis.append('line')
              .attr('x1', monthStart)
              .attr('x2', monthStart)
              .attr('y1', -28)
              .attr('y2', 3)
              .attr('stroke', '#ddd')
              .attr('stroke-width', 1);
          }
        }
      });

      // Year labels (tertiary axis)
      const years = d3.timeYears(d3.timeYear.floor(xDomain[0]), d3.timeYear.offset(xDomain[1], 1));
      const yearAxis = g.append('g')
        .attr('class', 'x-axis x-axis-years')
        .attr('transform', `translate(0, ${innerHeight + 46})`);

      years.forEach((year, i) => {
        const yearStart = Math.max(xScale(year), 0);
        const nextYear = years[i + 1] || xDomain[1];
        const yearEnd = Math.min(xScale(nextYear), innerWidth);
        const yearWidth = yearEnd - yearStart;

        if (yearWidth > 40) {
          yearAxis.append('text')
            .attr('x', yearStart + yearWidth / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('font-weight', '600')
            .style('fill', '#333')
            .text(d3.timeFormat('%Y')(year));

          if (i > 0) {
            yearAxis.append('line')
              .attr('x1', yearStart)
              .attr('x2', yearStart)
              .attr('y1', -18)
              .attr('y2', 3)
              .attr('stroke', '#bbb')
              .attr('stroke-width', 1);
          }
        }
      });
    }

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d3.format(',')(d as number)))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");

    // Y-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
      .style('fill', '#666')
      .text('Test Drives');

    // Tooltip line and circle
    const tooltipLine = g.append('line')
      .attr('class', 'tooltip-line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const tooltipCircle = g.append('circle')
      .attr('class', 'tooltip-circle')
      .attr('r', 5)
      .attr('fill', '#051C2A')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const tooltip = d3.select(chartArea)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0);

    // Hover interaction
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event, this);
        const x0 = xScale.invert(mx);
        const bisect = d3.bisector<typeof aggregatedData[0], Date>(d => d.date).left;
        const idx = bisect(aggregatedData, x0, 1);
        const d0 = aggregatedData[idx - 1];
        const d1 = aggregatedData[idx];
        const d = d1 && (x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime()) ? d1 : d0;

        if (d) {
          tooltipLine
            .attr('x1', xScale(d.date))
            .attr('x2', xScale(d.date))
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .style('opacity', 1);

          tooltipCircle
            .attr('cx', xScale(d.date))
            .attr('cy', yScale(d.testDrives))
            .style('opacity', 1);

          const formatDate = aggregation === 'year' ? d3.timeFormat('%Y')
            : aggregation === 'month' ? d3.timeFormat('%b %Y')
            : d3.timeFormat('%b %d, %Y');

          tooltip
            .style('opacity', 1)
            .style('left', `${event.offsetX + 15}px`)
            .style('top', `${event.offsetY - 10}px`)
            .html(`<strong>${formatDate(d.date)}</strong><br/>Test Drives: ${d.testDrives.toLocaleString()}`);
        }
      })
      .on('mouseout', function() {
        tooltipLine.style('opacity', 0);
        tooltipCircle.style('opacity', 0);
        tooltip.style('opacity', 0);
      });

  }, [aggregatedData, aggregation, showLive]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 50);

    const chartArea = containerRef.current?.querySelector('.historical-chart .chart-area') as HTMLElement;
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
    <div className={`test-drives-over-time ${showLive ? 'split-view' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drives Over Time</h3>
        <div className="chart-controls">
          <div className="chart-toggle">
            <button
              className={`toggle-btn ${aggregation === 'day' ? 'active' : ''}`}
              onClick={() => setAggregation('day')}
            >
              Day
            </button>
            <button
              className={`toggle-btn ${aggregation === 'week' ? 'active' : ''}`}
              onClick={() => setAggregation('week')}
            >
              Week
            </button>
            <button
              className={`toggle-btn ${aggregation === 'month' ? 'active' : ''}`}
              onClick={() => setAggregation('month')}
            >
              Month
            </button>
            <button
              className={`toggle-btn ${aggregation === 'year' ? 'active' : ''}`}
              onClick={() => setAggregation('year')}
            >
              Year
            </button>
          </div>
          <button
            className={`live-btn ${showLive ? 'active' : ''}`}
            onClick={() => setShowLive(!showLive)}
          >
            <span className="live-dot"></span>
            Live
          </button>
        </div>
      </div>

      <div className="chart-content">
        <div className="historical-chart">
          <div className="chart-area" />
        </div>
        {showLive && (
          <div className="live-chart">
            <LiveTestDrives headless />
          </div>
        )}
      </div>
    </div>
  );
}

export default TestDrivesOverTime;
