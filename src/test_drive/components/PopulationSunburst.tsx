import { useCallback, useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import './PopulationSunburst.css';

interface HierarchyDataNode {
  name: string;
  value?: number;
  children?: HierarchyDataNode[];
}

// Extended type for sunburst nodes with current/target states
interface SunburstNode extends d3.HierarchyRectangularNode<HierarchyDataNode> {
  current: { x0: number; x1: number; y0: number; y1: number };
  target?: { x0: number; x1: number; y0: number; y1: number };
}

// Population data by region
const populationData: HierarchyDataNode = {
  name: "World",
  children: [
    {
      name: "Asia",
      children: [
        {
          name: "East Asia",
          children: [
            { name: "China", value: 1412 },
            { name: "Japan", value: 125 },
            { name: "South Korea", value: 52 },
            { name: "Taiwan", value: 24 },
            { name: "Mongolia", value: 3 }
          ]
        },
        {
          name: "South Asia",
          children: [
            { name: "India", value: 1408 },
            { name: "Pakistan", value: 231 },
            { name: "Bangladesh", value: 171 },
            { name: "Nepal", value: 30 },
            { name: "Sri Lanka", value: 22 }
          ]
        },
        {
          name: "Southeast Asia",
          children: [
            { name: "Indonesia", value: 277 },
            { name: "Philippines", value: 115 },
            { name: "Vietnam", value: 98 },
            { name: "Thailand", value: 72 },
            { name: "Malaysia", value: 34 },
            { name: "Singapore", value: 6 }
          ]
        },
        {
          name: "Western Asia",
          children: [
            { name: "Turkey", value: 85 },
            { name: "Iran", value: 87 },
            { name: "Iraq", value: 44 },
            { name: "Saudi Arabia", value: 36 },
            { name: "UAE", value: 10 },
            { name: "Israel", value: 9 }
          ]
        }
      ]
    },
    {
      name: "Africa",
      children: [
        {
          name: "North Africa",
          children: [
            { name: "Egypt", value: 104 },
            { name: "Algeria", value: 45 },
            { name: "Morocco", value: 37 },
            { name: "Tunisia", value: 12 },
            { name: "Libya", value: 7 }
          ]
        },
        {
          name: "West Africa",
          children: [
            { name: "Nigeria", value: 218 },
            { name: "Ghana", value: 33 },
            { name: "Ivory Coast", value: 28 },
            { name: "Senegal", value: 17 },
            { name: "Mali", value: 22 }
          ]
        },
        {
          name: "East Africa",
          children: [
            { name: "Ethiopia", value: 123 },
            { name: "Kenya", value: 54 },
            { name: "Tanzania", value: 65 },
            { name: "Uganda", value: 48 },
            { name: "Rwanda", value: 14 }
          ]
        },
        {
          name: "Southern Africa",
          children: [
            { name: "South Africa", value: 60 },
            { name: "Mozambique", value: 33 },
            { name: "Zimbabwe", value: 16 },
            { name: "Zambia", value: 20 },
            { name: "Botswana", value: 2 }
          ]
        }
      ]
    },
    {
      name: "Europe",
      children: [
        {
          name: "Western Europe",
          children: [
            { name: "Germany", value: 84 },
            { name: "France", value: 68 },
            { name: "Netherlands", value: 18 },
            { name: "Belgium", value: 12 },
            { name: "Austria", value: 9 },
            { name: "Switzerland", value: 9 }
          ]
        },
        {
          name: "Southern Europe",
          children: [
            { name: "Italy", value: 59 },
            { name: "Spain", value: 48 },
            { name: "Greece", value: 10 },
            { name: "Portugal", value: 10 }
          ]
        },
        {
          name: "Northern Europe",
          children: [
            { name: "United Kingdom", value: 67 },
            { name: "Sweden", value: 10 },
            { name: "Norway", value: 5 },
            { name: "Denmark", value: 6 },
            { name: "Finland", value: 6 },
            { name: "Ireland", value: 5 }
          ]
        },
        {
          name: "Eastern Europe",
          children: [
            { name: "Russia", value: 144 },
            { name: "Ukraine", value: 41 },
            { name: "Poland", value: 38 },
            { name: "Romania", value: 19 },
            { name: "Czech Republic", value: 11 },
            { name: "Hungary", value: 10 }
          ]
        }
      ]
    },
    {
      name: "Americas",
      children: [
        {
          name: "North America",
          children: [
            { name: "United States", value: 335 },
            { name: "Mexico", value: 129 },
            { name: "Canada", value: 39 }
          ]
        },
        {
          name: "Central America",
          children: [
            { name: "Guatemala", value: 18 },
            { name: "Honduras", value: 10 },
            { name: "El Salvador", value: 6 },
            { name: "Costa Rica", value: 5 },
            { name: "Panama", value: 4 }
          ]
        },
        {
          name: "South America",
          children: [
            { name: "Brazil", value: 215 },
            { name: "Colombia", value: 52 },
            { name: "Argentina", value: 46 },
            { name: "Peru", value: 34 },
            { name: "Venezuela", value: 28 },
            { name: "Chile", value: 20 },
            { name: "Ecuador", value: 18 }
          ]
        },
        {
          name: "Caribbean",
          children: [
            { name: "Cuba", value: 11 },
            { name: "Dominican Republic", value: 11 },
            { name: "Haiti", value: 12 },
            { name: "Jamaica", value: 3 },
            { name: "Puerto Rico", value: 3 }
          ]
        }
      ]
    },
    {
      name: "Oceania",
      children: [
        {
          name: "Australia & NZ",
          children: [
            { name: "Australia", value: 26 },
            { name: "New Zealand", value: 5 }
          ]
        },
        {
          name: "Pacific Islands",
          children: [
            { name: "Papua New Guinea", value: 10 },
            { name: "Fiji", value: 1 },
            { name: "Solomon Islands", value: 1 }
          ]
        }
      ]
    }
  ]
};

function formatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}B`;
  }
  return `${value}M`;
}

export function PopulationSunburst() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>();

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    const chartArea = containerRef.current.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    // Clear previous
    d3.select(chartArea).selectAll('*').remove();

    const containerWidth = chartArea.clientWidth || 300;
    const containerHeight = chartArea.clientHeight || 300;
    const size = Math.min(containerWidth, containerHeight);
    const radius = size / 6;

    // Create the color scale - rainbow interpolation
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, (populationData.children?.length || 1) + 1)
    );

    // Compute the layout
    const hierarchy = d3.hierarchy(populationData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Partition with y-dimension based on depth levels
    const root = d3.partition<HierarchyDataNode>()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy) as SunburstNode;

    const totalValue = root.value || 1;

    // Initialize current state for each node
    root.each(d => {
      (d as SunburstNode).current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
    });

    // Create the arc generator
    const arc = d3.arc<SunburstNode>()
      .startAngle(d => d.current.x0)
      .endAngle(d => d.current.x1)
      .padAngle(d => Math.min((d.current.x1 - d.current.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.current.y0 * radius)
      .outerRadius(d => Math.max(d.current.y0 * radius, d.current.y1 * radius - 1));

    // Create SVG centered
    const svg = d3.select(chartArea)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('viewBox', `${-containerWidth / 2} ${-containerHeight / 2} ${containerWidth} ${containerHeight}`)
      .style('font', '10px sans-serif');

    // Append the arcs
    const path = svg.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1) as SunburstNode[])
      .join('path')
      .attr('fill', d => {
        // Walk up to depth 1 to get color
        let node: d3.HierarchyRectangularNode<HierarchyDataNode> = d;
        while (node.depth > 1 && node.parent) node = node.parent;
        return color(node.data.name);
      })
      .attr('fill-opacity', d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr('pointer-events', d => arcVisible(d.current) ? 'auto' : 'none')
      .attr('d', d => arc(d) || '');

    // Make clickable if they have children
    path.filter(d => !!d.children)
      .style('cursor', 'pointer')
      .on('click', clicked);

    // Add title tooltips
    const format = d3.format(',d');
    const percentFormat = d3.format('.1%');
    path.append('title')
      .text(d => {
        const percent = (d.value || 0) / totalValue;
        return `${d.ancestors().map(n => n.data.name).reverse().join(' > ')}\n${format(d.value || 0)}M (${percentFormat(percent)})`;
      });

    // Add labels group
    const labelGroup = svg.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none');

    // Add labels
    const label = labelGroup
      .selectAll('text')
      .data(root.descendants().slice(1) as SunburstNode[])
      .join('text')
      .attr('dy', '0.35em')
      .attr('transform', d => labelTransform(d.current))
      .attr('fill-opacity', d => +labelVisible(d.current))
      .style('font-size', '9px')
      .text(d => d.data.name);

    // Parent circle for navigating back (invisible but clickable)
    const parent = svg.append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('click', clicked);

    // Center text showing current node info
    const centerLabel = svg.append('text')
      .attr('class', 'center-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(root.data.name);

    const centerValue = svg.append('text')
      .attr('class', 'center-value')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .text(formatValue(root.value || 0));

    // Track current focus
    let currentFocus = root;

    // Helper to update center display
    const updateCenterText = (node: SunburstNode) => {
      centerLabel.text(node.data.name);
      centerValue.text(formatValue(node.value || 0));
    };

    // Add hover effects
    path.on('mouseover', function (_, d) {
      if (!arcVisible(d.current)) return;
      d3.select(this).attr('fill-opacity', d.children ? 0.8 : 0.6);

      // Update breadcrumbs
      const ancestors = d.ancestors().reverse().slice(1);
      setBreadcrumbs(ancestors.map(a => a.data.name));

      // Show hovered node info in center
      updateCenterText(d);
    })
      .on('mouseout', function (_, d) {
        if (!arcVisible(d.current)) return;
        d3.select(this).attr('fill-opacity', d.children ? 0.6 : 0.4);
        setBreadcrumbs(undefined);

        // Restore current focus info
        updateCenterText(currentFocus);
      });

    // Handle zoom on click
    function clicked(_event: MouseEvent, p: SunburstNode) {
      parent.datum(p.parent || root);
      currentFocus = p;
      updateCenterText(p);

      // Calculate target positions
      root.each(d => {
        const node = d as SunburstNode;
        node.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        };
      });

      const t = svg.transition().duration(750);

      // Transition arcs
      path.transition(t as any)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target!);
          return (t: number) => { d.current = i(t); };
        })
        .filter(function (d) {
          return !!(+(this as SVGPathElement).getAttribute('fill-opacity')! || arcVisible(d.target!));
        })
        .attr('fill-opacity', d => arcVisible(d.target!) ? (d.children ? 0.6 : 0.4) : 0)
        .attr('pointer-events', d => arcVisible(d.target!) ? 'auto' : 'none')
        .attrTween('d', d => () => arc(d) || '');

      // Transition labels
      label.filter(function (d) {
        return !!(+(this as SVGTextElement).getAttribute('fill-opacity')! || labelVisible(d.target!));
      })
        .transition(t as any)
        .attr('fill-opacity', d => +labelVisible(d.target!))
        .attrTween('transform', d => () => labelTransform(d.current));
    }

    // Check if arc should be visible
    function arcVisible(d: { x0: number; x1: number; y0: number; y1: number }) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    // Check if label should be visible
    function labelVisible(d: { x0: number; x1: number; y0: number; y1: number }) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    // Transform for label positioning
    function labelTransform(d: { x0: number; x1: number; y0: number; y1: number }) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
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
    <div className="population-sunburst" ref={containerRef}>
      <div className="chart-header">
        <h3 className="chart-title">World Population by Region</h3>
      </div>
      <div className="chart-area" />
      <div className="breadcrumbs-container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, i) => (
              <span key={i}>
                {i > 0 && ' › '}
                {crumb}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PopulationSunburst;
