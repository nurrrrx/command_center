import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './DemographicsGender.css';

export interface GenderData {
  gender: 'male' | 'female';
  count: number;
}

interface DemographicsGenderProps {
  data: GenderData[];
  selectedGender: 'male' | 'female' | null;
  onGenderSelect: (gender: 'male' | 'female' | null) => void;
  headless?: boolean;
}

const GENDER_COLORS = {
  male: '#025645',    // BCG Green
  female: '#E6B437'   // Gold/Amber
};

export function DemographicsGender({
  data,
  selectedGender,
  onGenderSelect,
  headless = false
}: DemographicsGenderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const existingSvg = chartArea.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const containerWidth = chartArea.clientWidth || 400;
    const containerHeight = chartArea.clientHeight || 400;
    const size = Math.min(containerWidth, containerHeight);
    const margin = 20;
    const radius = (size - margin * 2) / 2;
    const innerRadius = radius * 0.6;

    const total = data.reduce((sum, d) => sum + d.count, 0);

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${size / 2}, ${size / 2})`);

    const pie = d3.pie<GenderData>()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<GenderData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => GENDER_COLORS[d.data.gender])
      .attr('opacity', d => {
        if (!selectedGender) return 1;
        return d.data.gender === selectedGender ? 1 : 0.3;
      })
      .attr('stroke', d => {
        if (selectedGender === d.data.gender) return '#333';
        return 'white';
      })
      .attr('stroke-width', d => selectedGender === d.data.gender ? 3 : 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        onGenderSelect(selectedGender === d.data.gender ? null : d.data.gender);
      })
      .on('mouseover', function(event, d) {
        if (selectedGender !== d.data.gender) {
          d3.select(this).attr('opacity', 0.8);
        }
      })
      .on('mouseout', function(event, d) {
        if (selectedGender !== d.data.gender) {
          d3.select(this).attr('opacity', selectedGender ? 0.3 : 1);
        }
      });

    // Add percentage and count labels on arcs
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => `${((d.data.count / total) * 100).toFixed(0)}%`);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '11px')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => d.data.count.toLocaleString());

    // Center text - total
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('font-size', '28px')
      .style('font-weight', '700')
      .style('fill', '#1a1a1a')
      .text(total.toLocaleString());

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Total Test Drives');

  }, [data, selectedGender, onGenderSelect]);

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
    <div className={`demographics-gender ${headless ? 'headless' : ''}`} ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Distribution by Gender</h3>
        {selectedGender && (
          <button className="clear-filter-btn" onClick={() => onGenderSelect(null)}>
            Clear Filter
          </button>
        )}
      </div>
      <div className="gender-legend">
        <button
          className={`legend-item ${selectedGender === 'male' ? 'selected' : ''} ${selectedGender === 'female' ? 'dimmed' : ''}`}
          onClick={() => onGenderSelect(selectedGender === 'male' ? null : 'male')}
        >
          <span className="legend-dot" style={{ backgroundColor: GENDER_COLORS.male }} />
          <span className="legend-label">Male</span>
        </button>
        <button
          className={`legend-item ${selectedGender === 'female' ? 'selected' : ''} ${selectedGender === 'male' ? 'dimmed' : ''}`}
          onClick={() => onGenderSelect(selectedGender === 'female' ? null : 'female')}
        >
          <span className="legend-dot" style={{ backgroundColor: GENDER_COLORS.female }} />
          <span className="legend-label">Female</span>
        </button>
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default DemographicsGender;
