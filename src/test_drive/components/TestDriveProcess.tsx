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
  const sources = ['Call Center', 'Instagram', 'Facebook', 'Google', 'Events', 'CRM', 'Website', 'Walk-in'];
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

  const leads: Lead[] = [];
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const stage = weightedStages[Math.floor(Math.random() * weightedStages.length)];
    const stageIndex = stageOrder.indexOf(stage);

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
      source: sources[Math.floor(Math.random() * sources.length)],
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

// Timeline stages (main flow path) with average durations in days
const timelineStages = [
  { label: 'Lead', avgDays: 0 },
  { label: 'CEC Called', avgDays: 1.2 },
  { label: 'Hot Lead', avgDays: 0.8 },
  { label: 'SM Assigned', avgDays: 1.5 },
  { label: 'SE Action', avgDays: 2.1 },
  { label: 'Opportunity', avgDays: 1.8 },
  { label: 'Test Drive', avgDays: 3.2 },
  { label: 'Order', avgDays: 2.5 },
  { label: 'Invoice', avgDays: 4.1 },
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

// Initialize mermaid with custom theme - increased padding for taller boxes
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
    fontSize: '11px',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 20,
    rankSpacing: 50,
    padding: 15,
    defaultRenderer: 'dagre',
  },
});

// Mermaid flowchart definition - horizontal with mock data values
const chartDefinition = `
flowchart LR
    %% Lead Sources - Column 1
    CC["<b>Call center</b><br/><b>inbound</b><br/><span style='font-size:14px'>1,245</span>"]
    IG["<b>Instagram</b><br/><span style='font-size:14px'>2,134</span>"]
    FB["<b>Facebook</b><br/><span style='font-size:14px'>1,876</span>"]
    GO["<b>Google</b><br/><span style='font-size:14px'>2,567</span>"]
    EV["<b>Events</b><br/><span style='font-size:14px'>456</span>"]
    CRM["<b>CRM</b><br/><span style='font-size:14px'>1,123</span>"]
    OOH["<b>OOH</b><br/><span style='font-size:14px'>345</span>"]

    %% Secondary Sources
    WEB["<b>Website</b><br/><span style='font-size:14px'>987</span>"]
    WALK["<b>Walk-in</b><br/><span style='font-size:14px'>654</span>"]

    %% Main Flow - Leads
    LEADS["<b>Leads</b><br/><span style='font-size:16px;font-weight:bold'>11,387</span>"]

    %% CEC Stage
    CEC_NC["<b>CEC – Not</b><br/><b>called yet</b><br/><span style='font-size:14px'>1,823</span>"]:::orange
    CEC_C["<b>CEC - Called</b><br/><span style='font-size:16px;font-weight:bold'>9,564</span>"]

    %% Lead Classification
    COLD["<b>Cold Lost leads</b><br/><span style='font-size:14px'>2,876</span>"]:::orange
    HOT["<b>Hot leads</b><br/><span style='font-size:16px;font-weight:bold'>6,688</span>"]

    %% Reasons
    R1["<b>Reason 1</b><br/><span style='font-size:12px'>1,234</span>"]
    R2["<b>Reason 2</b><br/><span style='font-size:12px'>987</span>"]
    R3["<b>Reason 3</b><br/><span style='font-size:12px'>655</span>"]

    %% Re-engagement
    NRE["<b>Not re-</b><br/><b>engaged</b><br/><span style='font-size:12px'>1,876</span>"]:::orange
    RE["<b>Re-engaged</b><br/><span style='font-size:12px'>1,000</span>"]

    %% SM Assignment
    SM_NA["<b>SM not yet</b><br/><b>assigned</b><br/><span style='font-size:12px'>892</span>"]:::orange
    SM_A["<b>Pass to Branch – SM Assigned</b><br/><span style='font-size:16px;font-weight:bold'>6,796</span>"]

    %% SE Stage
    SE_CL["<b>SE closed</b><br/><span style='font-size:12px'>456</span>"]:::orange
    NO_ACT["<b>No action</b><br/><span style='font-size:12px'>678</span>"]:::orange
    SE_ACT["<b>SE Action</b><br/><span style='font-size:16px;font-weight:bold'>5,662</span>"]

    %% Opportunities
    NOT_INT["<b>Not</b><br/><b>interested</b><br/><span style='font-size:12px'>1,123</span>"]:::orange
    OPP["<b>Opportunities</b><br/><span style='font-size:16px;font-weight:bold'>4,539</span>"]

    %% Test Drive
    NO_TD["<b>No test drive</b><br/><span style='font-size:12px'>1,234</span>"]:::orange
    TD["<b>Test drive</b><br/><span style='font-size:16px;font-weight:bold'>3,305</span>"]

    %% Orders
    ORD_CAN["<b>Orders</b><br/><b>cancelled</b><br/><span style='font-size:12px'>234</span>"]:::orange
    NO_ORD["<b>No order</b><br/><span style='font-size:12px'>1,567</span>"]:::orange
    ORD["<b>Orders</b><br/><span style='font-size:16px;font-weight:bold'>1,504</span>"]

    %% Final
    NO_INV["<b>No</b><br/><b>invoice</b><br/><span style='font-size:12px'>187</span>"]:::orange
    INV["<b>Invoices</b><br/><b>(cash, lease, finance)</b><br/><span style='font-size:16px;font-weight:bold'>1,317</span>"]

    %% Connections - Sources to Leads
    CC --> LEADS
    IG --> LEADS
    FB --> LEADS
    GO --> LEADS
    EV --> LEADS
    CRM --> WEB
    OOH --> WALK
    WEB --> LEADS
    WALK --> LEADS

    %% Leads split
    LEADS --> CEC_NC
    LEADS --> CEC_C

    %% CEC Called split
    CEC_C --> COLD
    CEC_C --> HOT

    %% Cold Lost to Reasons
    COLD --> R1
    COLD --> R2
    COLD --> R3

    %% Reasons to Re-engagement
    R1 --> NRE
    R1 --> RE
    R2 --> NRE
    R2 --> RE
    R3 --> NRE
    R3 --> RE

    %% Re-engaged joins hot flow
    RE --> SM_A

    %% Hot leads flow
    HOT --> SM_NA
    HOT --> SM_A

    %% SM Assigned flow
    SM_A --> SE_CL
    SM_A --> NO_ACT
    SM_A --> SE_ACT

    %% SE Action flow
    SE_ACT --> NOT_INT
    SE_ACT --> OPP

    %% Opportunities flow
    OPP --> NO_TD
    OPP --> TD

    %% Test Drive flow
    TD --> ORD_CAN
    TD --> NO_ORD
    TD --> ORD

    %% Orders flow
    ORD --> NO_INV
    ORD --> INV

    %% Styling - increased padding in class definitions
    classDef default fill:#3B5998,stroke:#2D4373,stroke-width:2px,color:#FFFFFF,padding:12px
    classDef orange fill:#E5A853,stroke:#C88B32,stroke-width:2px,color:#FFFFFF,padding:12px
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

  // Filter leads for drawer
  const filteredLeads = mockLeads.filter(lead => {
    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
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
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Generate unique ID
        const id = `mermaid-${Date.now()}`;

        // Render mermaid chart
        const { svg } = await mermaid.render(id, chartDefinition);

        // Insert the SVG
        containerRef.current.innerHTML = svg;

        // Style adjustments after render
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.maxWidth = '100%';
          svgElement.style.maxHeight = '100%';
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    // Small delay to ensure container is mounted
    const timeoutId = setTimeout(renderChart, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`test-drive-process ${headless ? 'headless' : ''}`}>
      {/* Main content area */}
      <div className="process-main-content">
        <div className="chart-container" ref={containerRef}>
          <div className="loading-placeholder">Loading chart...</div>
        </div>

        {/* Timeline showing average durations */}
        <div className="process-timeline">
          {timelineStages.map((stage, index) => (
            <div key={stage.label} className="timeline-item">
              <div className="timeline-stage">{stage.label}</div>
              {index < timelineStages.length - 1 && (
                <div className="timeline-connector">
                  <div className="timeline-line"></div>
                  <span className="timeline-duration">{timelineStages[index + 1].avgDays}d avg</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Inspect Leads Button */}
        <button
          className="inspect-leads-btn"
          onClick={() => setIsDrawerOpen(true)}
        >
          Inspect Leads
        </button>
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
