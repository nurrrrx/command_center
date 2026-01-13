import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './DemographicsAge.css';

export interface AgeGroupData {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}

interface DemographicsAgeProps {
  data: AgeGroupData[];
  selectedAgeGroup: string | null;
  selectedGender: 'male' | 'female' | null;
  onAgeGroupSelect: (ageGroup: string | null) => void;
  headless?: boolean;
}

const AGE_COLORS: Record<string, string> = {
  '18-25': '#025645',   // BCG Green
  '26-35': '#337B68',   // BCG Green lighter
  '36-45': '#E6B437',   // Gold
  '46-55': '#BF0404',   // Bain Red
  '55+': '#051C2A'      // Navy
};

const GENDER_COLORS = {
  male: '#025645',      // BCG Green
  female: '#E6B437'     // Gold
};

export function DemographicsAge({
  data,
  selectedAgeGroup,
  selectedGender,
  onAgeGroupSelect,
  headless = false
}: DemographicsAgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const containerWidth = chartArea.clientWidth || 600;
    const containerHeight = chartArea.clientHeight || 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
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

    // X Scale
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.ageGroup))
      .range([0, innerWidth])
      .padding(0.3);

    // Y Scale - use total or gender-specific max
    const maxValue = selectedGender
      ? Math.max(...data.map(d => d[selectedGender]))
      : Math.max(...data.map(d => d.total));

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

    // Determine if we show stacked bars or simple bars
    if (selectedGender) {
      // Show only the selected gender as simple bars
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.ageGroup) || 0)
        .attr('y', d => yScale(d[selectedGender]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d[selectedGender]))
        .attr('fill', GENDER_COLORS[selectedGender])
        .attr('opacity', d => {
          if (!selectedAgeGroup) return 1;
          return d.ageGroup === selectedAgeGroup ? 1 : 0.3;
        })
        .attr('stroke', d => d.ageGroup === selectedAgeGroup ? '#333' : 'none')
        .attr('stroke-width', 2)
        .attr('rx', 3)
        .style('cursor', 'pointer')
        .on('click', (_event, d) => {
          onAgeGroupSelect(selectedAgeGroup === d.ageGroup ? null : d.ageGroup);
        })
        .on('mouseover', function(event, d) {
          if (selectedAgeGroup !== d.ageGroup) {
            d3.select(this).attr('opacity', 0.8);
          }
        })
        .on('mouseout', function(event, d) {
          if (selectedAgeGroup !== d.ageGroup) {
            d3.select(this).attr('opacity', selectedAgeGroup ? 0.3 : 1);
          }
        });

      // Value labels
      g.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => (xScale(d.ageGroup) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d[selectedGender]) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#333')
        .style('opacity', d => {
          if (!selectedAgeGroup) return 1;
          return d.ageGroup === selectedAgeGroup ? 1 : 0.3;
        })
        .text(d => d[selectedGender].toLocaleString());
    } else {
      // Show stacked bars (male + female) or simple colored bars
      if (selectedAgeGroup) {
        // When an age group is selected, show stacked bars for gender breakdown
        const stackedData = data.map(d => ({
          ageGroup: d.ageGroup,
          male: d.male,
          female: d.female
        }));

        // Female bars (bottom)
        g.selectAll('.bar-female')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar-female')
          .attr('x', d => xScale(d.ageGroup) || 0)
          .attr('y', d => yScale(d.female))
          .attr('width', xScale.bandwidth())
          .attr('height', d => innerHeight - yScale(d.female))
          .attr('fill', GENDER_COLORS.female)
          .attr('opacity', d => d.ageGroup === selectedAgeGroup ? 1 : 0.3)
          .attr('rx', 0)
          .style('cursor', 'pointer')
          .on('click', (_event, d) => {
            onAgeGroupSelect(selectedAgeGroup === d.ageGroup ? null : d.ageGroup);
          });

        // Male bars (top, stacked on female)
        g.selectAll('.bar-male')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar-male')
          .attr('x', d => xScale(d.ageGroup) || 0)
          .attr('y', d => yScale(d.female + d.male))
          .attr('width', xScale.bandwidth())
          .attr('height', d => innerHeight - yScale(d.male))
          .attr('fill', GENDER_COLORS.male)
          .attr('opacity', d => d.ageGroup === selectedAgeGroup ? 1 : 0.3)
          .attr('rx', 0)
          .style('cursor', 'pointer')
          .on('click', (_event, d) => {
            onAgeGroupSelect(selectedAgeGroup === d.ageGroup ? null : d.ageGroup);
          });

        // Add rounded top corners to the top bar
        g.selectAll('.bar-male')
          .attr('rx', 3);

      } else {
        // No selection - show bars colored by age group
        g.selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.ageGroup) || 0)
          .attr('y', d => yScale(d.total))
          .attr('width', xScale.bandwidth())
          .attr('height', d => innerHeight - yScale(d.total))
          .attr('fill', d => AGE_COLORS[d.ageGroup] || '#4285f4')
          .attr('opacity', 1)
          .attr('rx', 3)
          .style('cursor', 'pointer')
          .on('click', (_event, d) => {
            onAgeGroupSelect(d.ageGroup);
          })
          .on('mouseover', function() {
            d3.select(this).attr('opacity', 0.8);
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
          });

        // Value labels
        g.selectAll('.value-label')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'value-label')
          .attr('x', d => (xScale(d.ageGroup) || 0) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d.total) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('font-weight', '600')
          .style('fill', '#333')
          .text(d => d.total.toLocaleString());
      }
    }

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#333');

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d3.format(',')(d as number)))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#666');

    // Y-axis label
    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text('Test Drives');

  }, [data, selectedAgeGroup, selectedGender, onAgeGroupSelect]);

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
    <div className={`demographics-age ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Distribution by Age</h3>
        {selectedAgeGroup && (
          <button className="clear-filter-btn" onClick={() => onAgeGroupSelect(null)}>
            Clear Filter
          </button>
        )}
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default DemographicsAge;
