import { useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { occurrenceData } from '../data/mockData';
import './OccurrenceRadial.css';

interface OccurrenceRadialProps {
  filters?: {
    startDate?: string;
    endDate?: string;
  };
}

type HierarchyNode = d3.HierarchyRectangularNode<{
  name: string;
  value?: number;
  children?: { name: string; value?: number; children?: { name: string; value: number }[] }[];
}>;

export function OccurrenceRadial({ filters: _filters }: OccurrenceRadialProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    // Clear previous
    d3.select(chartArea).selectAll('*').remove();

    const containerWidth = chartArea.clientWidth || 300;
    const containerHeight = chartArea.clientHeight || 300;
    const size = Math.min(containerWidth, containerHeight);
    // Leave margin for labels around the chart
    const radius = size / 2 - 50;

    // Prepare hierarchical data
    const hierarchyData = {
      name: 'Bookings',
      children: [
        {
          name: 'Show',
          children: [
            { name: 'First Show', value: occurrenceData.show.firstShow },
            { name: 'Rescheduled', value: occurrenceData.show.rescheduled }
          ]
        },
        {
          name: 'No-Show',
          children: [
            { name: 'Cancelled', value: occurrenceData.noShow.cancelled },
            { name: 'No Show', value: occurrenceData.noShow.noShowActual }
          ]
        }
      ]
    };

    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('display', 'block');

    const g = svg.append('g')
      .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);

    // Color scheme - BCG Green for Show, Bain Red for No-Show, McKinsey for accents
    const colorScheme: Record<string, string> = {
      'Bookings': '#051C2A',
      'Show': '#025645',
      'First Show': '#025645',
      'Rescheduled': '#337B68',
      'No-Show': '#BF0404',
      'Cancelled': '#E6B437',
      'No Show': '#BF0404'
    };

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData)
      .sum(d => (d as any).value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as HierarchyNode;

    // Partition layout
    const partitionLayout = d3.partition<typeof hierarchyData>()
      .size([2 * Math.PI, radius]);

    partitionLayout(root);

    // Store original positions for each node
    root.each(d => {
      (d as any).current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
      (d as any).target = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
    });

    // Arc generator that takes explicit coordinates
    const arcGenerator = (d: { x0: number; x1: number; y0: number; y1: number }) => {
      return d3.arc()({
        startAngle: d.x0,
        endAngle: d.x1,
        innerRadius: d.y0,
        outerRadius: d.y1 - 2,
        padAngle: 0.02,
        padRadius: radius / 3
      });
    };

    // Create tooltip
    const tooltip = d3.select(chartArea)
      .append('div')
      .attr('class', 'sunburst-tooltip')
      .style('opacity', 0);

    // Get all nodes except root
    const nodes = root.descendants().filter(d => d.depth > 0);

    // Track current focus
    let currentFocus: HierarchyNode = root;

    // Labels group will be created after arcs (for proper z-order)
    let labelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    // Function to update labels based on current state - labels positioned next to arcs
    const updateLabels = (focusNode: HierarchyNode) => {
      labelsGroup.selectAll('*').remove();

      // Get leaf nodes (depth 2) for external labels
      const leafNodes = nodes.filter(d => d.depth === 2);
      const total = focusNode === root ? occurrenceData.totalBooked : (focusNode.value || 1);

      leafNodes.forEach((d) => {
        const current = (d as any).current;
        const arcSpan = current.x1 - current.x0;

        // Skip if arc is too small or not visible
        if (arcSpan < 0.05 || current.y1 <= 0) return;

        // Skip the focused node itself (it's shown in center)
        if (focusNode !== root && d === focusNode) return;

        const pct = ((d.value || 0) / total * 100).toFixed(0);

        // Calculate arc edge point
        const angle = (current.x0 + current.x1) / 2;
        const arcRadius = current.y1;
        const arcX = Math.sin(angle) * arcRadius;
        const arcY = -Math.cos(angle) * arcRadius;

        // Label position - just outside the arc
        const labelRadius = arcRadius + 8;
        const labelX = Math.sin(angle) * labelRadius;
        const labelY = -Math.cos(angle) * labelRadius;

        // Determine text anchor based on angle
        const isLeftSide = angle > Math.PI;
        const textAnchor = Math.abs(angle - Math.PI) < 0.3 ? 'middle' : (isLeftSide ? 'end' : 'start');

        // Draw short leader line from arc edge to label
        labelsGroup.append('line')
          .attr('class', 'leader-line')
          .attr('x1', arcX)
          .attr('y1', arcY)
          .attr('x2', labelX)
          .attr('y2', labelY)
          .attr('stroke', '#bbb')
          .attr('stroke-width', 1)
          .style('pointer-events', 'none');

        // Add label text (name + percentage on same line)
        labelsGroup.append('text')
          .attr('class', 'external-label')
          .attr('x', labelX + (textAnchor === 'start' ? 4 : textAnchor === 'end' ? -4 : 0))
          .attr('y', labelY)
          .attr('text-anchor', textAnchor)
          .attr('dy', '0.35em')
          .style('font-size', '9px')
          .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .style('font-weight', '500')
          .style('fill', '#333')
          .style('pointer-events', 'none')
          .text(`${d.data.name} `);

        // Add percentage after name
        labelsGroup.append('text')
          .attr('class', 'external-pct')
          .attr('x', labelX + (textAnchor === 'start' ? 4 : textAnchor === 'end' ? -4 : 0))
          .attr('y', labelY + 11)
          .attr('text-anchor', textAnchor)
          .style('font-size', '9px')
          .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
          .style('font-weight', '600')
          .style('fill', colorScheme[d.data.name] || '#666')
          .style('pointer-events', 'none')
          .text(`${pct}%`);
      });
    };

    // Function to update center text
    const updateCenterText = (focusNode: HierarchyNode) => {
      centerGroup.selectAll('*').remove();

      const innerR = focusNode === root ? (root.y1 || radius * 0.33) : radius * 0.33;

      // Center circle (clickable for going back)
      centerGroup.append('circle')
        .attr('r', innerR - 5)
        .attr('fill', 'white')
        .attr('class', 'center-circle')
        .style('cursor', focusNode !== root ? 'pointer' : 'default')
        .on('click', () => {
          if (focusNode !== root) {
            clicked(null, root);
          }
        });

      if (focusNode === root) {
        centerGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.2em')
          .style('font-size', `${Math.min(24, size / 14)}px`)
          .style('font-weight', '700')
          .style('fill', '#1a1a1a')
          .text(occurrenceData.totalBooked.toLocaleString());

        centerGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1.2em')
          .style('font-size', `${Math.min(11, size / 32)}px`)
          .style('fill', '#666')
          .text('Total Bookings');
      } else {
        centerGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.5em')
          .style('font-size', `${Math.min(20, size / 16)}px`)
          .style('font-weight', '700')
          .style('fill', '#1a1a1a')
          .text((focusNode.value || 0).toLocaleString());

        centerGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.8em')
          .style('font-size', `${Math.min(12, size / 28)}px`)
          .style('fill', '#666')
          .text(focusNode.data.name);

        centerGroup.append('text')
          .attr('class', 'back-button')
          .attr('text-anchor', 'middle')
          .attr('dy', '2.5em')
          .style('font-size', `${Math.min(10, size / 32)}px`)
          .style('fill', '#3b82f6')
          .style('cursor', 'pointer')
          .text('← Back')
          .on('click', () => clicked(null, root));
      }
    };

    // Click handler for drill-down
    const clicked = (_event: any, p: HierarchyNode) => {
      currentFocus = p;

      // Calculate new target positions
      root.each(d => {
        const target = (d as any).target;
        if (p === root) {
          // Zooming out to root - restore original positions
          target.x0 = d.x0;
          target.x1 = d.x1;
          target.y0 = d.y0;
          target.y1 = d.y1;
        } else {
          // Zooming into a node
          const x0 = p.x0;
          const x1 = p.x1;
          const xd = d3.scaleLinear().domain([x0, x1]).range([0, 2 * Math.PI]);
          const yd = d3.scaleLinear().domain([p.y0, radius]).range([0, radius]);

          if (d.x0 >= x0 && d.x1 <= x1) {
            // Node is a descendant of p
            target.x0 = xd(d.x0);
            target.x1 = xd(d.x1);
            target.y0 = yd(d.y0);
            target.y1 = yd(d.y1);
          } else {
            // Node is not visible
            target.x0 = 0;
            target.x1 = 0;
            target.y0 = 0;
            target.y1 = 0;
          }
        }
      });

      // Transition arcs
      paths.transition()
        .duration(750)
        .attrTween('d', d => {
          const current = (d as any).current;
          const target = (d as any).target;
          const interpolateX0 = d3.interpolate(current.x0, target.x0);
          const interpolateX1 = d3.interpolate(current.x1, target.x1);
          const interpolateY0 = d3.interpolate(current.y0, target.y0);
          const interpolateY1 = d3.interpolate(current.y1, target.y1);

          return (t: number) => {
            current.x0 = interpolateX0(t);
            current.x1 = interpolateX1(t);
            current.y0 = interpolateY0(t);
            current.y1 = interpolateY1(t);
            return arcGenerator(current) || '';
          };
        })
        .style('opacity', d => {
          const target = (d as any).target;
          return target.x1 - target.x0 > 0.001 ? 1 : 0;
        })
        .on('end', function(_, i) {
          if (i === 0) {
            updateLabels(currentFocus);
          }
        });

      // Update center text immediately
      updateCenterText(p);

      // Hide labels during transition
      labelsGroup.selectAll('*').remove();
    };

    // Draw arcs
    const paths = g.selectAll<SVGPathElement, HierarchyNode>('path.arc-path')
      .data(nodes)
      .enter()
      .append('path')
      .attr('class', 'arc-path')
      .attr('d', d => arcGenerator((d as any).current) || '')
      .attr('fill', d => colorScheme[d.data.name] || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', 0);

    // Entrance animation
    paths.transition()
      .duration(800)
      .delay((_, i) => i * 50)
      .style('opacity', 1);

    // Click and hover handlers
    paths
      .on('click', (event, d) => {
        // Only drill down on first-level nodes (Show, No-Show)
        if (d.depth === 1) {
          clicked(event, d);
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 0.8);

        const total = currentFocus === root ? occurrenceData.totalBooked : (currentFocus.value || 1);
        const percentage = ((d.value || 0) / total * 100).toFixed(1);
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.data.name}</strong><br/>
            ${(d.value || 0).toLocaleString()} bookings<br/>
            ${percentage}% of ${currentFocus === root ? 'total' : currentFocus.data.name}
            ${d.depth === 1 ? '<br/><em>Click to drill down</em>' : ''}
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
        d3.select(this).style('opacity', 1);
        tooltip.style('opacity', 0);
      });

    // Center group
    const centerGroup = g.append('g').attr('class', 'center-text');

    // Initial center text with animation
    const innerR = root.y1 || radius * 0.33;
    centerGroup.append('circle')
      .attr('r', innerR - 5)
      .attr('fill', 'white')
      .attr('class', 'center-circle');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .style('font-size', `${Math.min(24, size / 14)}px`)
      .style('font-weight', '700')
      .style('fill', '#1a1a1a')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay(300)
      .style('opacity', 1)
      .tween('text', function() {
        const i = d3.interpolateNumber(0, occurrenceData.totalBooked);
        return function(t) {
          this.textContent = Math.round(i(t)).toLocaleString();
        };
      });

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', `${Math.min(11, size / 32)}px`)
      .style('fill', '#666')
      .style('opacity', 0)
      .text('Total Bookings')
      .transition()
      .duration(400)
      .delay(500)
      .style('opacity', 1);

    // Create labels group AFTER arcs and center (for proper z-order - labels on top)
    labelsGroup = g.append('g').attr('class', 'labels-group');

    // Add labels after entrance animation
    setTimeout(() => {
      updateLabels(root);
    }, 900);

  }, []);

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
    <div className="occurrence-radial" ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">Test Drive Attendance</h3>
      </div>
      <div className="chart-area" />
    </div>
  );
}

export default OccurrenceRadial;
