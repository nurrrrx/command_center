import { useRef, useEffect, useState } from 'react';
import mermaid from 'mermaid';
import './TestDriveProcess.css';

// Lead status stages in the process
const PROCESS_STAGES = [
  'Lead Created',
  'CEC Not Called',
  'CEC Called',
  'Cold Lost',
  'Hot Lead',
  'SM Not Assigned',
  'SM Assigned',
  'SE Closed',
  'No Action',
  'SE Action',
  'Not Interested',
  'Opportunity',
  'No Test Drive',
  'Test Drive',
  'Order Cancelled',
  'No Order',
  'Order',
  'No Invoice',
  'Invoiced'
] as const;

type ProcessStage = typeof PROCESS_STAGES[number];

// Mock lead data with timing metrics
interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  model: string;
  showroom: string;
  stage: ProcessStage;
  leadDate: string;
  // Timing metrics (days to reach each stage, null if not reached)
  daysToQualification: number | null;
  daysToBooking: number | null;
  daysToTestDrive: number | null;
  daysToOrder: number | null;
  daysToInvoice: number | null;
}

// Stage progression order for determining which timing metrics apply
const stageOrder: ProcessStage[] = [
  'Lead Created', 'CEC Not Called', 'CEC Called', 'Cold Lost', 'Hot Lead',
  'SM Not Assigned', 'SM Assigned', 'SE Closed', 'No Action', 'SE Action',
  'Not Interested', 'Opportunity', 'No Test Drive', 'Test Drive',
  'Order Cancelled', 'No Order', 'Order', 'No Invoice', 'Invoiced'
];

// Generate mock leads data with timing metrics
const generateMockLeads = (): Lead[] => {
  const firstNames = ['Ahmed', 'Mohammed', 'Fatima', 'Sarah', 'Omar', 'Layla', 'Youssef', 'Nadia', 'Hassan', 'Amira', 'Khalid', 'Mariam', 'Saeed', 'Huda', 'Rashed'];
  const lastNames = ['Al Rashid', 'Hassan', 'Ibrahim', 'Khalil', 'Al Qasim', 'Mahmoud', 'Ahmed', 'Ali', 'Farooq', 'Al Mualla', 'Saeed', 'Al Falasi', 'Rashid', 'Abdullah', 'Al Hashimi'];
  // Updated sources to match all chart nodes
  const sources = [
    'Call Center', 'Instagram', 'Facebook', 'Twitter', 'TikTok',
    'Organic/Paid Search', 'Events', 'Web', 'Social', 'Blue',
    'Live Chat', 'Walking Lead'
  ];
  const models = ['RX350', 'NX350h', 'ES300h', 'LX600', 'GX460', 'IS300', 'LC500', 'UX250h', 'LS500h', 'RC350'];
  const showrooms = ['DFC', 'Sheikh Zayed', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'DIP', 'RAK', 'Ajman', 'Fujairah'];

  // Weight distribution for stages
  const stageWeights: Record<ProcessStage, number> = {
    'Lead Created': 5, 'CEC Not Called': 8, 'CEC Called': 12, 'Cold Lost': 6,
    'Hot Lead': 15, 'SM Not Assigned': 4, 'SM Assigned': 18, 'SE Closed': 3,
    'No Action': 4, 'SE Action': 14, 'Not Interested': 5, 'Opportunity': 12,
    'No Test Drive': 4, 'Test Drive': 10, 'Order Cancelled': 2, 'No Order': 5,
    'Order': 8, 'No Invoice': 2, 'Invoiced': 6
  };

  const weightedStages: ProcessStage[] = [];
  for (const [stage, weight] of Object.entries(stageWeights)) {
    for (let i = 0; i < weight; i++) {
      weightedStages.push(stage as ProcessStage);
    }
  }

  // Weighted source distribution to match chart data
  const sourceWeights: Record<string, number> = {
    'Call Center': 12,
    'Instagram': 18,
    'Facebook': 16,
    'Twitter': 5,
    'TikTok': 8,
    'Organic/Paid Search': 16,
    'Events': 4,
    'Web': 10,
    'Social': 8,
    'Blue': 2,
    'Live Chat': 3,
    'Walking Lead': 8,
  };

  const weightedSources: string[] = [];
  for (const [source, weight] of Object.entries(sourceWeights)) {
    for (let i = 0; i < weight; i++) {
      weightedSources.push(source);
    }
  }

  const leads: Lead[] = [];
  for (let i = 0; i < 500; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const stage = weightedStages[Math.floor(Math.random() * weightedStages.length)];
    const stageIndex = stageOrder.indexOf(stage);
    const source = weightedSources[Math.floor(Math.random() * weightedSources.length)];

    const createdDaysAgo = Math.floor(Math.random() * 60) + 1;
    const leadDate = new Date();
    leadDate.setDate(leadDate.getDate() - createdDaysAgo);

    // Generate timing based on stage progression (cumulative days)
    // Qualification = Hot Lead stage (index 4)
    // Booking = SM Assigned (index 6)
    // Test Drive = Test Drive (index 13)
    // Order = Order (index 16)
    // Invoice = Invoiced (index 18)

    const qualificationReached = stageIndex >= 4;
    const bookingReached = stageIndex >= 6;
    const testDriveReached = stageIndex >= 13;
    const orderReached = stageIndex >= 16;
    const invoiceReached = stageIndex >= 18;

    leads.push({
      id: `LD-${String(10000 + i).slice(1)}`,
      name: `${firstName} ${lastName}`,
      phone: `+971 5${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@email.com`,
      source,
      model: models[Math.floor(Math.random() * models.length)],
      showroom: showrooms[Math.floor(Math.random() * showrooms.length)],
      stage,
      leadDate: leadDate.toISOString().split('T')[0],
      daysToQualification: qualificationReached ? Math.floor(Math.random() * 90) + 5 : null,
      daysToBooking: bookingReached ? Math.floor(Math.random() * 90) + 10 : null,
      daysToTestDrive: testDriveReached ? Math.floor(Math.random() * 90) + 5 : null,
      daysToOrder: orderReached ? Math.floor(Math.random() * 90) + 10 : null,
      daysToInvoice: invoiceReached ? Math.floor(Math.random() * 90) + 15 : null,
    });
  }

  return leads;
};

const mockLeads = generateMockLeads();

// Stage to Mermaid node ID mapping
const stageToNodeId: Record<ProcessStage, string> = {
  'Lead Created': 'LEADS',
  'CEC Not Called': 'CEC_NC',
  'CEC Called': 'CEC_C',
  'Cold Lost': 'COLD',
  'Hot Lead': 'HOT',
  'SM Not Assigned': 'SM_NA',
  'SM Assigned': 'SM_A',
  'SE Closed': 'SE_CL',
  'No Action': 'NO_ACT',
  'SE Action': 'SE_ACT',
  'Not Interested': 'NOT_INT',
  'Opportunity': 'OPP',
  'No Test Drive': 'NO_TD',
  'Test Drive': 'TD',
  'Order Cancelled': 'ORD_CAN',
  'No Order': 'NO_ORD',
  'Order': 'ORD',
  'No Invoice': 'NO_INV',
  'Invoiced': 'INV'
};

// Reverse mapping: node ID to stage
const nodeIdToStage: Record<string, ProcessStage> = Object.fromEntries(
  Object.entries(stageToNodeId).map(([stage, nodeId]) => [nodeId, stage as ProcessStage])
);

// Additional node types for sources, reasons, and engagement states
type SourceType = 'Call Center' | 'Instagram' | 'Facebook' | 'Twitter' | 'TikTok' | 'Organic/Paid Search' | 'Events' | 'Web' | 'Social' | 'Blue' | 'Live Chat' | 'Walking Lead';
type ReasonType = 'Reason 1' | 'Reason 2' | 'Reason 3';
type EngagementType = 'Not Re-engaged' | 'Re-engaged';

// Node ID to source mapping
const nodeIdToSource: Record<string, SourceType> = {
  'CC': 'Call Center',
  'IG': 'Instagram',
  'FB': 'Facebook',
  'TW': 'Twitter',
  'TK': 'TikTok',
  'SEARCH': 'Organic/Paid Search',
  'EV': 'Events',
  'WEB': 'Web',
  'SOCIAL': 'Social',
  'BLUE': 'Blue',
  'LIVECHAT': 'Live Chat',
  'WALK_LEAD': 'Walking Lead',
};

// Node ID to reason mapping
const nodeIdToReason: Record<string, ReasonType> = {
  'R1': 'Reason 1',
  'R2': 'Reason 2',
  'R3': 'Reason 3',
};

// Node ID to engagement mapping
const nodeIdToEngagement: Record<string, EngagementType> = {
  'NRE': 'Not Re-engaged',
  'RE': 'Re-engaged',
};

// Stage metrics for display below subgraphs - with filter stages
const stageMetrics = [
  { name: 'Lead', avgDays: 4.2, totalLeads: 11387, filterStages: ['Lead Created', 'CEC Not Called', 'CEC Called'] as ProcessStage[] },
  { name: 'Qualification', avgDays: 3.8, totalLeads: 9564, filterStages: ['Cold Lost', 'Hot Lead', 'SM Not Assigned', 'SM Assigned'] as ProcessStage[] },
  { name: 'Booking', avgDays: 5.1, totalLeads: 6796, filterStages: ['SE Closed', 'No Action', 'SE Action', 'Not Interested', 'Opportunity'] as ProcessStage[] },
  { name: 'Test Drive', avgDays: 6.3, totalLeads: 3305, filterStages: ['No Test Drive', 'Test Drive'] as ProcessStage[] },
  { name: 'Ordering & Invoicing', avgDays: 2.2, totalLeads: 1504, filterStages: ['Order Cancelled', 'No Order', 'Order', 'No Invoice', 'Invoiced'] as ProcessStage[] },
];

// Mock data for the process - aggregated values
export const processMetrics = {
  sources: {
    callCenter: 1245,
    instagram: 2134,
    facebook: 1876,
    google: 2567,
    events: 456,
    crm: 1123,
    ooh: 345,
    website: 987,
    walkin: 654,
  },
  leads: 11387,
  cecNotCalled: 1823,
  cecCalled: 9564,
  coldLost: 2876,
  hotLeads: 6688,
  reasons: { r1: 1234, r2: 987, r3: 655 },
  notReengaged: 1876,
  reengaged: 1000,
  smNotAssigned: 892,
  smAssigned: 6796,
  seClosed: 456,
  noAction: 678,
  seAction: 5662,
  notInterested: 1123,
  opportunities: 4539,
  noTestDrive: 1234,
  testDrive: 3305,
  ordersCancelled: 234,
  noOrder: 1567,
  orders: 1504,
  noInvoice: 187,
  invoices: 1317,
};

// Initialize mermaid with custom theme - minimal padding, larger font
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#3B5998',
    primaryTextColor: '#FFFFFF',
    primaryBorderColor: '#2D4373',
    lineColor: '#333333',
    secondaryColor: '#E5A853',
    tertiaryColor: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: '16px',
    clusterBkg: '#f8fafc',
    clusterBorder: '#94a3b8',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 25,
    rankSpacing: 55,
    padding: 8,
    defaultRenderer: 'dagre',
    subGraphTitleMargin: {
      top: 30,
      bottom: 15,
    },
  },
});

// Mermaid flowchart definition - horizontal with subgraphs for stages
// Percentages calculated from previous node in the flow
const chartDefinition = `
flowchart LR
    %% LEAD SUBGRAPH - Sources to CEC Called
    subgraph LEAD_STAGE [" Lead "]
        direction LR
        SEARCH["<b>Organic/Paid</b><br/><b>Search</b><br/>1,842<br/><i>16.2%</i>"]
        FB["<b>Facebook</b><br/>1,876<br/><i>16.5%</i>"]
        TW["<b>Twitter</b><br/>543<br/><i>4.8%</i>"]
        TK["<b>TikTok</b><br/>876<br/><i>7.7%</i>"]
        IG["<b>Instagram</b><br/>2,134<br/><i>18.7%</i>"]
        WEB["<b>Web</b><br/>4,118<br/><i>36.2%</i>"]
        SOCIAL["<b>Social</b><br/>3,652<br/><i>32.1%</i>"]
        BLUE["<b>Blue</b><br/>234<br/><i>2.1%</i>"]
        EV["<b>Events</b><br/>456<br/><i>4.0%</i>"]
        LIVECHAT["<b>Live Chat</b><br/>312<br/><i>2.7%</i>"]
        CC["<b>Call center</b><br/><b>Inbound</b><br/>1,245<br/><i>10.9%</i>"]
        WALK_LEAD["<b>Walking</b><br/><b>Lead</b><br/>876<br/><i>7.7%</i>"]
        LEADS["<b>Leads</b><br/><b>11,387</b><br/><i>100%</i>"]
        CEC_NC["<b>CEC – Not</b><br/><b>called yet</b><br/>1,823<br/><i>16.0%</i>"]:::orange
        CEC_C["<b>CEC - Called</b><br/><b>9,564</b><br/><i>84.0%</i>"]
    end

    %% QUALIFICATION SUBGRAPH - Cold/Hot to SM Assigned
    subgraph QUAL_STAGE [" Qualification "]
        direction LR
        COLD["<b>Cold Lost leads</b><br/>2,876<br/><i>30.1%</i>"]:::orange
        HOT["<b>Hot leads</b><br/><b>6,688</b><br/><i>69.9%</i>"]
        R1["<b>Reason 1</b><br/>1,234<br/><i>42.9%</i>"]
        R2["<b>Reason 2</b><br/>987<br/><i>34.3%</i>"]
        R3["<b>Reason 3</b><br/>655<br/><i>22.8%</i>"]
        NRE["<b>Not re-</b><br/><b>engaged</b><br/>1,876<br/><i>65.2%</i>"]:::orange
        RE["<b>Re-engaged</b><br/>1,000<br/><i>34.8%</i>"]
        SM_NA["<b>SM not yet</b><br/><b>assigned</b><br/>892<br/><i>11.6%</i>"]:::orange
        SM_A["<b>Pass to Branch – SM Assigned</b><br/><b>6,796</b><br/><i>88.4%</i>"]
    end

    %% BOOKING SUBGRAPH - SE stages to Opportunities
    subgraph BOOK_STAGE [" Booking "]
        direction LR
        SE_CL["<b>SE closed</b><br/>456<br/><i>6.7%</i>"]:::orange
        NO_ACT["<b>No action</b><br/>678<br/><i>10.0%</i>"]:::orange
        SE_ACT["<b>SE Action</b><br/><b>5,662</b><br/><i>83.3%</i>"]
        NOT_INT["<b>Not</b><br/><b>interested</b><br/>1,123<br/><i>19.8%</i>"]:::orange
        OPP["<b>Opportunities</b><br/><b>5,415</b><br/><i>80.2%</i>"]
    end

    %% TEST DRIVE SUBGRAPH
    subgraph TD_STAGE [" Test Drive "]
        direction LR
        NO_TD["<b>No test drive</b><br/>1,234<br/><i>27.2%</i>"]:::orange
        TD["<b>Test drive</b><br/><b>3,305</b><br/><i>72.8%</i>"]
    end

    %% ORDERING & INVOICING SUBGRAPH - combined for horizontal layout
    subgraph ORD_INV_STAGE [" Ordering & Invoicing "]
        direction LR
        NO_ORD["<b>No order</b><br/>1,567<br/><i>47.4%</i>"]:::orange
        ORD["<b>Orders</b><br/><b>1,504</b><br/><i>45.5%</i>"]
        ORD_CAN["<b>Orders</b><br/><b>cancelled</b><br/>234<br/><i>7.1%</i>"]:::orange
        NO_INV["<b>No</b><br/><b>invoice</b><br/>187<br/><i>12.4%</i>"]:::orange
        INV["<b>Invoices</b><br/><b>(cash, lease, finance)</b><br/><b>1,317</b><br/><i>87.6%</i>"]
    end

    %% Internal connections - Lead Stage
    SEARCH --> WEB
    FB --> WEB
    FB --> SOCIAL
    TW --> WEB
    TW --> SOCIAL
    TK --> SOCIAL
    IG --> WEB
    IG --> SOCIAL
    WEB --> LEADS
    SOCIAL --> LEADS
    BLUE --> LEADS
    EV --> LEADS
    LIVECHAT --> LEADS
    CC --> LEADS
    LEADS --> CEC_NC
    LEADS --> CEC_C

    %% Lead to Qualification connection
    CEC_C --> COLD
    CEC_C --> HOT

    %% Internal connections - Qualification Stage
    COLD --> R1
    COLD --> R2
    COLD --> R3
    R1 --> NRE
    R1 --> RE
    R2 --> NRE
    R2 --> RE
    R3 --> NRE
    R3 --> RE
    RE --> SM_A
    HOT --> SM_NA
    HOT --> SM_A

    %% Qualification to Booking connection
    SM_A --> SE_CL
    SM_A --> NO_ACT
    SM_A --> SE_ACT

    %% Internal connections - Booking Stage
    SE_ACT --> NOT_INT
    SE_ACT --> OPP
    WALK_LEAD --> OPP

    %% Booking to Test Drive connection
    OPP --> NO_TD
    OPP --> TD

    %% Test Drive to Ordering connection
    TD --> NO_ORD
    TD --> ORD

    %% Ordering to Invoicing connection
    ORD --> ORD_CAN
    ORD --> NO_INV
    ORD --> INV

    %% Styling - minimal padding
    classDef default fill:#3B5998,stroke:#2D4373,stroke-width:2px,color:#FFFFFF,padding:6px
    classDef orange fill:#E5A853,stroke:#C88B32,stroke-width:2px,color:#FFFFFF,padding:6px
`;

interface TestDriveProcessProps {
  headless?: boolean;
}

// Helper to get stage color
const getStageColor = (stage: ProcessStage): string => {
  const orangeStages: ProcessStage[] = [
    'CEC Not Called', 'Cold Lost', 'SM Not Assigned', 'SE Closed',
    'No Action', 'Not Interested', 'No Test Drive', 'Order Cancelled',
    'No Order', 'No Invoice'
  ];
  return orangeStages.includes(stage) ? '#E5A853' : '#3B5998';
};

// Helper to get color for duration cells (green=fast, yellow=medium, red=slow)
const getDurationColor = (days: number | null): string => {
  if (days === null) return 'transparent';
  if (days <= 25) return '#4ade80'; // green
  if (days <= 50) return '#facc15'; // yellow
  if (days <= 75) return '#fb923c'; // orange
  return '#f87171'; // red
};

export function TestDriveProcess({ headless = false }: TestDriveProcessProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<ProcessStage | 'all'>('all');
  const [multiStageFilter, setMultiStageFilter] = useState<ProcessStage[] | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceType | null>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen]);

  // Handle clicking on a Mermaid node to open drawer with that stage filtered
  const handleNodeClick = (stage: ProcessStage) => {
    setMultiStageFilter(null);
    setSourceFilter(null);
    setStageFilter(stage);
    setIsDrawerOpen(true);
  };

  // Handle clicking on a source node
  const handleSourceClick = (source: SourceType) => {
    setMultiStageFilter(null);
    setStageFilter('all');
    setSourceFilter(source);
    setIsDrawerOpen(true);
  };

  // Handle clicking on a stage area button (filters by multiple stages)
  const handleStageAreaClick = (filterStages: ProcessStage[]) => {
    setStageFilter('all');
    setMultiStageFilter(filterStages);
    setSourceFilter(null);
    setIsDrawerOpen(true);
  };

  // Filter leads for drawer
  const filteredLeads = mockLeads.filter(lead => {
    // Source filter
    if (sourceFilter && lead.source !== sourceFilter) {
      return false;
    }
    // Multi-stage filter takes precedence
    if (multiStageFilter && multiStageFilter.length > 0) {
      if (!multiStageFilter.includes(lead.stage)) return false;
    } else if (stageFilter !== 'all' && lead.stage !== stageFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        lead.name.toLowerCase().includes(term) ||
        lead.id.toLowerCase().includes(term) ||
        lead.phone.includes(term) ||
        lead.model.toLowerCase().includes(term) ||
        lead.showroom.toLowerCase().includes(term) ||
        lead.source.toLowerCase().includes(term)
      );
    }
    return true;
  });

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        containerRef.current.innerHTML = '';
        const id = `mermaid-main-${Date.now()}`;
        const { svg } = await mermaid.render(id, chartDefinition);
        containerRef.current.innerHTML = svg;

        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.width = '100%';
          svgElement.style.height = '100%';
          svgElement.style.maxHeight = '100%';
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

          // Add click handlers to all nodes
          const nodes = svgElement.querySelectorAll('.node');
          nodes.forEach((node) => {
            const nodeElement = node as HTMLElement;
            // Match node IDs like flowchart-CC-123, flowchart-CEC_NC-456, flowchart-R1-789
            const idMatch = nodeElement.id.match(/flowchart-([A-Za-z0-9_]+)-/);
            if (idMatch) {
              const nodeId = idMatch[1];
              nodeElement.style.cursor = 'pointer';

              // Check if it's a stage node
              const stage = nodeIdToStage[nodeId];
              if (stage) {
                nodeElement.addEventListener('click', () => {
                  setMultiStageFilter(null);
                  setSourceFilter(null);
                  setStageFilter(stage);
                  setIsDrawerOpen(true);
                });
                return;
              }

              // Check if it's a source node
              const source = nodeIdToSource[nodeId];
              if (source) {
                nodeElement.addEventListener('click', () => {
                  setMultiStageFilter(null);
                  setStageFilter('all');
                  setSourceFilter(source);
                  setIsDrawerOpen(true);
                });
                return;
              }

              // Check if it's a reason node (filter by Cold Lost stage)
              const reason = nodeIdToReason[nodeId];
              if (reason) {
                nodeElement.addEventListener('click', () => {
                  setMultiStageFilter(null);
                  setSourceFilter(null);
                  setStageFilter('Cold Lost');
                  setIsDrawerOpen(true);
                });
                return;
              }

              // Check if it's an engagement node
              const engagement = nodeIdToEngagement[nodeId];
              if (engagement) {
                nodeElement.addEventListener('click', () => {
                  setMultiStageFilter(null);
                  setSourceFilter(null);
                  // Re-engaged leads go to SM Assigned, Not Re-engaged stay cold
                  setStageFilter(engagement === 'Re-engaged' ? 'SM Assigned' : 'Cold Lost');
                  setIsDrawerOpen(true);
                });
                return;
              }
            }
          });
        }
      } catch (error) {
        console.error('Chart rendering error:', error);
      }
    };

    // Small delay to ensure container is mounted
    const timeoutId = setTimeout(renderChart, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`test-drive-process ${headless ? 'headless' : ''}`}>
      {/* Investigate Leads Button - Top Right */}
      <button
        className="investigate-leads-btn"
        onClick={() => {
          setStageFilter('all');
          setMultiStageFilter(null);
          setSourceFilter(null);
          setIsDrawerOpen(true);
        }}
      >
        Investigate Leads
      </button>

      {/* Main content area */}
      <div className="process-main-content">
        <div className="chart-container" ref={containerRef}>
          <div className="loading-placeholder">Loading chart...</div>
        </div>

        {/* Stage Metrics Bar */}
        <div className="stage-metrics-bar">
          {stageMetrics.map((stage, index) => (
            <div key={stage.name} className="stage-metric">
              <button
                className="stage-metric-name"
                onClick={() => handleStageAreaClick(stage.filterStages)}
              >
                {stage.name}
              </button>
              <div className="stage-metric-values">
                <span className="metric-leads">{stage.totalLeads.toLocaleString()} leads</span>
                <span className="metric-days">{stage.avgDays} days avg</span>
              </div>
              {index < stageMetrics.length - 1 && (
                <div className="metric-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Drawer */}
      {isDrawerOpen && (
        <div className="leads-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="leads-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Lead Inspection</h3>
              <div className="drawer-controls">
                <input
                  type="text"
                  className="drawer-search"
                  placeholder="Search by name, ID, phone, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="drawer-stage-filter"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as ProcessStage | 'all')}
                >
                  <option value="all">All Stages</option>
                  {PROCESS_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            <div className="drawer-table-wrapper">
              <table className="drawer-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Source</th>
                    <th>Model</th>
                    <th>Showroom</th>
                    <th>Stage</th>
                    <th>Lead Date</th>
                    <th className="duration-header">Days to Qualification</th>
                    <th className="duration-header">Days to Booking</th>
                    <th className="duration-header">Days to Test Drive</th>
                    <th className="duration-header">Days to Order</th>
                    <th className="duration-header">Days to Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td className="lead-id">{lead.id}</td>
                      <td className="lead-name">{lead.name}</td>
                      <td className="lead-phone">{lead.phone}</td>
                      <td>{lead.source}</td>
                      <td>{lead.model}</td>
                      <td>{lead.showroom}</td>
                      <td>
                        <span
                          className="stage-badge"
                          style={{ backgroundColor: getStageColor(lead.stage) }}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td>{lead.leadDate}</td>
                      <td
                        className="duration-cell"
                        style={{ backgroundColor: getDurationColor(lead.daysToQualification) }}
                      >
                        {lead.daysToQualification ?? '-'}
                      </td>
                      <td
                        className="duration-cell"
                        style={{ backgroundColor: getDurationColor(lead.daysToBooking) }}
                      >
                        {lead.daysToBooking ?? '-'}
                      </td>
                      <td
                        className="duration-cell"
                        style={{ backgroundColor: getDurationColor(lead.daysToTestDrive) }}
                      >
                        {lead.daysToTestDrive ?? '-'}
                      </td>
                      <td
                        className="duration-cell"
                        style={{ backgroundColor: getDurationColor(lead.daysToOrder) }}
                      >
                        {lead.daysToOrder ?? '-'}
                      </td>
                      <td
                        className="duration-cell"
                        style={{ backgroundColor: getDurationColor(lead.daysToInvoice) }}
                      >
                        {lead.daysToInvoice ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="drawer-footer">
              Showing {filteredLeads.length} of {mockLeads.length} leads
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestDriveProcess;
