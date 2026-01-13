import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ageDistributionData, genderDistributionData, genderByAgeData, ageByGenderData } from '../data/mockData';
import './DemographicsChart.css';

interface DemographicsChartProps {
  filters?: {
    startDate?: string;
    endDate?: string;
  };
}

export function DemographicsChart({ filters: _filters }: DemographicsChartProps) {
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  // Internal state for linked selection
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  // Get age data based on selected gender
  const ageData = useMemo(() => {
    if (selectedGender && ageByGenderData[selectedGender]) {
      return ageByGenderData[selectedGender];
    }
    return ageDistributionData;
  }, [selectedGender]);

  // Get gender data based on selected age group
  const genderData = useMemo(() => {
    if (selectedAgeGroup && genderByAgeData[selectedAgeGroup]) {
      return genderByAgeData[selectedAgeGroup];
    }
    return genderDistributionData;
  }, [selectedAgeGroup]);

  const genderTotal = useMemo(() =>
    genderData.reduce((sum, d) => sum + d.count, 0),
    [genderData]
  );

  // Handle age group click
  const handleAgeGroupClick = useCallback((ageGroup: string | null) => {
    setSelectedAgeGroup(ageGroup);
    setSelectedGender(null);
  }, []);

  // Handle gender click
  const handleGenderClick = useCallback((gender: string | null) => {
    setSelectedGender(gender);
    setSelectedAgeGroup(null);
  }, []);

  // Render bar chart (Age Distribution)
  const renderBarChart = useCallback(() => {
    if (!barChartRef.current) return;

    const existingSvg = barChartRef.current.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Get container width for responsive sizing
    const containerWidth = barChartRef.current.clientWidth || 450;

    const margin = { top: 20, right: 20, bottom: 50, left: 55 };
    const width = Math.max(containerWidth, 350);
    const height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(barChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales - use max from full data for consistent scale
    const maxCount = Math.max(...ageDistributionData.map(d => d.count));

    const xScale = d3.scaleBand()
      .domain(ageData.map(d => d.ageGroup))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, maxCount * 1.15])
      .range([innerHeight, 0]);

    // Color scale - vibrant categorical palette
    const colors = [
      '#00897b', // teal
      '#0288d1', // light blue
      '#7b1fa2', // purple
      '#c62828', // red
      '#ef6c00', // orange
      '#fdd835', // yellow
      '#43a047', // green
      '#5e35b1'  // deep purple
    ];
    const colorScale = (i: number) => colors[i % colors.length];

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

    // Bars with click interaction - NO rounded corners
    g.selectAll('.bar')
      .data(ageData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.ageGroup) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', (_, i) => colorScale(i))
      .attr('opacity', d => selectedAgeGroup === null || selectedAgeGroup === d.ageGroup ? 1 : 0.3)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        handleAgeGroupClick(selectedAgeGroup === d.ageGroup ? null : d.ageGroup);
      })
      .on('mouseover', function(_, d) {
        if (selectedAgeGroup === null || selectedAgeGroup === d.ageGroup) {
          d3.select(this).attr('opacity', 0.8);
        }
      })
      .on('mouseout', function(_, d) {
        d3.select(this).attr('opacity',
          selectedAgeGroup === null || selectedAgeGroup === d.ageGroup ? 1 : 0.3);
      });

    // Value labels on bars
    g.selectAll('.value-label')
      .data(ageData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => (xScale(d.ageGroup) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text(d => d.count.toLocaleString());

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .selectAll('text')
      .style('font-size', '12px');

    // X-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Age Group');

    // Y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d3.format(',')(d as number)))
      .call(g => g.select('.domain').remove());

  }, [ageData, selectedAgeGroup, handleAgeGroupClick]);

  // Render pie chart (Gender Distribution)
  const renderPieChart = useCallback(() => {
    if (!pieChartRef.current) return;

    const existingSvg = pieChartRef.current.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.55; // Donut hole

    const colors = {
      Male: '#051C2A',
      Female: '#163E93'
    };

    const svg = d3.select(pieChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof genderData[0]>()
      .value(d => d.count)
      .sort(null)
      .padAngle(0.03);

    const arc = d3.arc<d3.PieArcDatum<typeof genderData[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 15)
      .cornerRadius(0); // NO rounded corners

    const hoverArc = d3.arc<d3.PieArcDatum<typeof genderData[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 8)
      .cornerRadius(0); // NO rounded corners

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(genderData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colors[d.data.gender as keyof typeof colors])
      .attr('opacity', d => selectedGender === null || selectedGender === d.data.gender ? 1 : 0.4)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        handleGenderClick(selectedGender === d.data.gender ? null : d.data.gender);
      })
      .on('mouseover', function(_, d) {
        if (selectedGender === null || selectedGender === d.data.gender) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', hoverArc(d) as string);
        }
      })
      .on('mouseout', function(_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc(d) as string);
      });

    // Labels on arc
    const labelArc = d3.arc<d3.PieArcDatum<typeof genderData[0]>>()
      .innerRadius(radius * 0.75)
      .outerRadius(radius * 0.75);

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '14px')
      .style('font-weight', '700')
      .style('fill', 'white')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.3)')
      .style('pointer-events', 'none')
      .text(d => `${d.data.percentage}%`);

    // Center text - total
    g.append('text')
      .attr('class', 'center-total')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('font-size', '24px')
      .style('font-weight', '700')
      .style('fill', '#1a1a1a')
      .text(genderTotal.toLocaleString());

    g.append('text')
      .attr('class', 'center-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '11px')
      .style('fill', '#666')
      .text(selectedAgeGroup ? `Age ${selectedAgeGroup}` : 'Total');

  }, [genderData, genderTotal, selectedAgeGroup, selectedGender, handleGenderClick]);

  useEffect(() => {
    renderBarChart();
  }, [renderBarChart]);

  useEffect(() => {
    renderPieChart();
  }, [renderPieChart]);

  const handleClearSelection = () => {
    setSelectedAgeGroup(null);
    setSelectedGender(null);
  };

  return (
    <div className="demographics-chart">
      <div className="chart-header">
        <h3 className="chart-title">Customer Demographics</h3>
        <p className="chart-subtitle">
          {selectedAgeGroup
            ? `Age ${selectedAgeGroup} selected - showing gender breakdown`
            : selectedGender
            ? `${selectedGender} selected - showing age distribution`
            : 'Click a bar or slice to see linked data'}
        </p>
      </div>

      <div className="charts-container">
        {/* Age Distribution (Bar Chart) */}
        <div className="chart-section">
          <div className="section-header">
            <span className="section-title">Distribution by Age</span>
            {selectedGender && (
              <span className="filter-badge">{selectedGender}</span>
            )}
          </div>
          <div className="bar-chart-area" ref={barChartRef} />
        </div>

        {/* Gender Distribution (Pie Chart) */}
        <div className="chart-section">
          <div className="section-header">
            <span className="section-title">Distribution by Gender</span>
            {selectedAgeGroup && (
              <span className="filter-badge">Age {selectedAgeGroup}</span>
            )}
          </div>
          <div className="pie-chart-wrapper">
            <div className="pie-chart-area" ref={pieChartRef} />
            <div className="gender-legend">
              {genderData.map(d => (
                <div
                  key={d.gender}
                  className={`legend-item clickable ${selectedGender === d.gender ? 'selected' : ''}`}
                  onClick={() => handleGenderClick(selectedGender === d.gender ? null : d.gender)}
                >
                  <span
                    className="legend-swatch"
                    style={{ backgroundColor: d.gender === 'Male' ? '#051C2A' : '#163E93' }}
                  />
                  <span className="legend-label">{d.gender}</span>
                  <span className="legend-value">{d.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(selectedAgeGroup || selectedGender) && (
        <button
          className="clear-selection-btn"
          onClick={handleClearSelection}
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}

export default DemographicsChart;
