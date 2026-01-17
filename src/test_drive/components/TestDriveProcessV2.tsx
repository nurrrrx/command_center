import { useCallback, useState, useEffect, useMemo, memo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Position,
  Handle,
  MarkerType,
} from 'reactflow';
import type { Node, Edge, NodeProps } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './TestDriveProcessV2.css';
import { Input } from '@/components/ui/input';
import { Search, Settings, X } from 'lucide-react';

// Custom node component with bold name and tooltip
const CustomNode = memo(({ data, sourcePosition, targetPosition }: NodeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const lines = data.label.split('\n');
  // Find where numbers start (name ends) - look for line that starts with a number or contains %
  let nameEndIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^\d|%$/.test(lines[i].trim())) {
      nameEndIndex = i;
      break;
    }
    nameEndIndex = i + 1;
  }

  const nameLines = lines.slice(0, nameEndIndex);
  const valueLines = lines.slice(nameEndIndex);
  const nodeName = nameLines.join(' ');

  return (
    <div
      className="custom-flow-node"
      style={data.nodeStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={targetPosition || Position.Left} />
      <div className="node-content">
        <div className="node-name">{nameLines.join('\n')}</div>
        {valueLines.length > 0 && <div className="node-values">{valueLines.join('\n')}</div>}
      </div>
      <Handle type="source" position={sourcePosition || Position.Right} />
      {showTooltip && (
        <div className="node-tooltip">
          Click to view {nodeName} leads
        </div>
      )}
    </div>
  );
});

// Node types for React Flow
const nodeTypes = {
  custom: CustomNode,
};

// Lead status stages in the process
const PROCESS_STAGES = [
  'Lead Created',
  'CEC Not Called',
  'CEC Called',
  'Attempt 1',
  'Attempt 2',
  'Attempt 3',
  'Qualified',
  'Cold Lost',
  'Hot Lead',
  'Passed to Branch',
  'SE Not Assigned',
  'SE Assigned',
  'SE Closed',
  'No Action',
  'SE Action',
  'Not Interested',
  'Opportunity',
  'No Test Drive',
  'Test Drive Booked',
  'Completed',
  'Rescheduled',
  'Cancelled',
  'Order Cancelled',
  'No Order',
  'Order',
  'F&I Application',
  'Approved',
  'Rejected',
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
  daysToQualification: number | null;
  daysToBooking: number | null;
  daysToTestDrive: number | null;
  daysToOrder: number | null;
  daysToInvoice: number | null;
}

// Stage progression order
const stageOrder: ProcessStage[] = [...PROCESS_STAGES];

// Generate mock leads data
const generateMockLeads = (): Lead[] => {
  const firstNames = ['Ahmed', 'Mohammed', 'Fatima', 'Sarah', 'Omar', 'Layla', 'Youssef', 'Nadia', 'Hassan', 'Amira'];
  const lastNames = ['Al Rashid', 'Hassan', 'Ibrahim', 'Khalil', 'Al Qasim', 'Mahmoud', 'Ahmed', 'Ali', 'Farooq', 'Al Mualla'];
  const sources = [
    'Organic Search', 'Paid Search', 'Instagram', 'Facebook', 'Twitter', 'TikTok', 'LinkedIn',
    'Web', 'Social Media', 'Blue', 'Events', 'Live Chat', 'Inbound Call Center', 'Walking Lead',
    'Unique Leads', 'Duplicated Leads'
  ];
  const models = ['RX350', 'NX350h', 'ES300h', 'LX600', 'GX460', 'IS300', 'LC500', 'UX250h'];
  const showrooms = ['DFC', 'Sheikh Zayed', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'DIP', 'RAK', 'Ajman'];

  const stageWeights: Record<ProcessStage, number> = {
    'Lead Created': 5, 'CEC Not Called': 8, 'CEC Called': 12, 'Attempt 1': 10, 'Attempt 2': 8,
    'Attempt 3': 6, 'Qualified': 15, 'Cold Lost': 6, 'Hot Lead': 15, 'Passed to Branch': 12,
    'SE Not Assigned': 4, 'SE Assigned': 18, 'SE Closed': 3, 'No Action': 4, 'SE Action': 14,
    'Not Interested': 5, 'Opportunity': 12, 'No Test Drive': 4, 'Test Drive Booked': 10,
    'Completed': 8, 'Rescheduled': 3, 'Cancelled': 2, 'Order Cancelled': 2, 'No Order': 5,
    'Order': 8, 'F&I Application': 5, 'Approved': 4, 'Rejected': 2, 'Invoiced': 6
  };

  const weightedStages: ProcessStage[] = [];
  for (const [stage, weight] of Object.entries(stageWeights)) {
    for (let i = 0; i < weight; i++) {
      weightedStages.push(stage as ProcessStage);
    }
  }

  const leads: Lead[] = [];
  for (let i = 0; i < 500; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const stage = weightedStages[Math.floor(Math.random() * weightedStages.length)];
    const stageIndex = stageOrder.indexOf(stage);

    const createdDaysAgo = Math.floor(Math.random() * 60) + 1;
    const leadDate = new Date();
    leadDate.setDate(leadDate.getDate() - createdDaysAgo);

    const qualificationReached = stageIndex >= 6;
    const bookingReached = stageIndex >= 9;
    const testDriveReached = stageIndex >= 19;
    const orderReached = stageIndex >= 24;
    const invoiceReached = stageIndex >= 28;

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

// Stage metrics for display
const stageMetrics = [
  { name: 'Lead Sourcing', avgDays: 4.2, totalLeads: 11387, filterStages: ['Lead Created', 'CEC Not Called', 'CEC Called', 'Attempt 1', 'Attempt 2', 'Attempt 3'] as ProcessStage[] },
  { name: 'Qualification', avgDays: 3.8, totalLeads: 9564, filterStages: ['Qualified', 'Cold Lost', 'Hot Lead', 'Passed to Branch', 'SE Not Assigned', 'SE Assigned'] as ProcessStage[] },
  { name: 'Booking', avgDays: 5.1, totalLeads: 6796, filterStages: ['SE Closed', 'No Action', 'SE Action', 'Not Interested', 'Opportunity'] as ProcessStage[] },
  { name: 'Test Drive', avgDays: 6.3, totalLeads: 3305, filterStages: ['No Test Drive', 'Test Drive Booked', 'Completed', 'Rescheduled', 'Cancelled'] as ProcessStage[] },
  { name: 'Ordering', avgDays: 1.5, totalLeads: 1800, filterStages: ['Order Cancelled', 'No Order', 'Order'] as ProcessStage[] },
  { name: 'Invoicing', avgDays: 2.2, totalLeads: 1504, filterStages: ['F&I Application', 'Approved', 'Rejected', 'Invoiced'] as ProcessStage[] },
];

// Helper to get stage color for drawer badges
const getStageColor = (stage: ProcessStage): string => {
  const orangeStages: ProcessStage[] = [
    'CEC Not Called', 'Cold Lost', 'SE Not Assigned', 'SE Closed',
    'No Action', 'Not Interested', 'No Test Drive', 'Order Cancelled',
    'No Order', 'Cancelled', 'Rescheduled', 'Rejected'
  ];
  return orangeStages.includes(stage) ? '#E5A853' : '#3B5998';
};

// Helper to get duration color
const getDurationColor = (days: number | null): string => {
  if (days === null) return 'transparent';
  if (days <= 25) return '#4ade80';
  if (days <= 50) return '#facc15';
  if (days <= 75) return '#fb923c';
  return '#f87171';
};

// Node dimensions for dagre layout
// Compact size to fit more content
const nodeWidth = 90;
const nodeHeight = 80;

// Subflow definitions - which nodes belong to which subflow
const SUBFLOW_DEFINITIONS: Record<string, { label: string; color: string; nodeIds: string[] }> = {
  'subflow-lead-sourcing': {
    label: 'Lead Sourcing',
    color: '#e0f2fe',
    nodeIds: ['ORGANIC', 'PAID', 'WEB', 'IG', 'FB', 'TK', 'LI', 'TW', 'SOCIAL', 'CC', 'BLUE', 'EV', 'LIVECHAT', 'LEADS', 'UNIQUE', 'DUP', 'CEC_C', 'CEC_NC', 'ATT1', 'ATT2', 'ATT3', 'WALK_LEAD'],
  },
  'subflow-qualification': {
    label: 'Qualification',
    color: '#fef3c7',
    nodeIds: ['QUALIFIED', 'HOT', 'COLD', 'PASS_BRANCH', 'R1', 'R2', 'R3', 'RE', 'NRE'],
  },
  'subflow-booking': {
    label: 'Booking',
    color: '#dbeafe',
    nodeIds: ['SE_A', 'SE_NA', 'SE_CL', 'NO_ACT', 'SE_ACT', 'OPP', 'NOT_INT'],
  },
  'subflow-test-drive': {
    label: 'Test Drive',
    color: '#dcfce7',
    nodeIds: ['TD_BOOK', 'NO_TD', 'TD_COMP', 'TD_RESCH', 'TD_CAN'],
  },
  'subflow-ordering': {
    label: 'Ordering',
    color: '#fce7f3',
    nodeIds: ['ORD', 'NO_ORD'],
  },
  'subflow-invoicing': {
    label: 'Invoicing',
    color: '#f3e8ff',
    nodeIds: ['INV', 'CASH', 'FI', 'ORD_CAN', 'APP1', 'APP2', 'APP3', 'APPROVED', 'REJECTED'],
  },
};

// Dagre layout function with subflow grouping
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 30, ranksep: 50 });

  // Only layout regular nodes (not groups)
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Position all regular nodes
  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Adjust Walking Leads position to align with LEADS node on x-axis
  const leadsNode = layoutedNodes.find(n => n.id === 'LEADS');
  const walkingLeadNode = layoutedNodes.find(n => n.id === 'WALK_LEAD');
  if (leadsNode && walkingLeadNode) {
    walkingLeadNode.position.x = leadsNode.position.x;
  }

  // Adjust Hot Leads position to align with Cold Lost Leads on x-axis
  const coldNode = layoutedNodes.find(n => n.id === 'COLD');
  const hotNode = layoutedNodes.find(n => n.id === 'HOT');
  if (coldNode && hotNode) {
    hotNode.position.x = coldNode.position.x;
  }

  // Adjust Cash Payment position to align with F&I Applications on x-axis
  const fiNode = layoutedNodes.find(n => n.id === 'FI');
  const cashNode = layoutedNodes.find(n => n.id === 'CASH');
  if (fiNode && cashNode) {
    cashNode.position.x = fiNode.position.x;
  }

  // Calculate bounding boxes for each subflow and create group nodes
  const groupNodes: Node[] = [];
  const labelNodes: Node[] = [];
  const padding = 20;
  const labelHeight = 30;

  Object.entries(SUBFLOW_DEFINITIONS).forEach(([groupId, subflow]) => {
    const subflowNodes = layoutedNodes.filter(n => subflow.nodeIds.includes(n.id));
    if (subflowNodes.length === 0) return;

    const minX = Math.min(...subflowNodes.map(n => n.position.x)) - padding;
    const minY = Math.min(...subflowNodes.map(n => n.position.y)) - padding - labelHeight;
    const maxX = Math.max(...subflowNodes.map(n => n.position.x + nodeWidth)) + padding;
    const maxY = Math.max(...subflowNodes.map(n => n.position.y + nodeHeight)) + padding;

    // Create group background node
    groupNodes.push({
      id: groupId,
      type: 'group',
      position: { x: minX, y: minY },
      data: { label: subflow.label },
      style: {
        width: maxX - minX,
        height: maxY - minY,
        backgroundColor: subflow.color,
        borderRadius: '12px',
        border: '2px solid #94a3b8',
      },
      zIndex: -1,
      selectable: false,
      draggable: false,
    });

    // Create label node for subflow name - centered at top
    const groupWidth = maxX - minX;
    labelNodes.push({
      id: `${groupId}-label`,
      type: 'default',
      position: { x: minX + groupWidth / 2 - 60, y: minY + 8 },
      data: { label: subflow.label },
      style: {
        background: 'transparent',
        color: '#1e293b',
        border: 'none',
        borderRadius: '0',
        padding: '0',
        fontSize: '12px',
        fontWeight: '700',
        minWidth: '120px',
        textAlign: 'center',
        boxShadow: 'none',
        whiteSpace: 'nowrap',
      },
      selectable: false,
      draggable: false,
      connectable: false,
      zIndex: 2,
    });
  });

  // Set zIndex on regular nodes to ensure they render above groups
  const nodesWithZIndex = layoutedNodes.map(node => ({
    ...node,
    zIndex: 1,
  }));

  // Return groups first (so they render behind), then label nodes, then regular nodes
  return { nodes: [...groupNodes, ...labelNodes, ...nodesWithZIndex], edges };
};

// Define initial nodes using custom node type with subflow groups
// Format: Line 1 = Name (bold), Line 2 = Volume, Line 3 = % from previous node
const createInitialNodes = (): Node[] => {
  const redStyle = { background: '#fee2e2', borderColor: '#f87171' };
  return [
    // ==================== SUBFLOW 1: LEAD SOURCING ====================
    // Source channels (% of total leads)
    // Labels split to 2 lines where needed to keep consistent width
    { id: 'ORGANIC', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Organic\nSearch\n1,245\n10.9%' } },
    { id: 'PAID', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Paid\nSearch\n1,087\n9.5%' } },
    { id: 'WEB', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Web\n4,118\n36.2%' } },
    { id: 'IG', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Instagram\n2,134\n18.7%' } },
    { id: 'FB', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Facebook\n1,876\n16.5%' } },
    { id: 'TK', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'TikTok\n876\n7.7%' } },
    { id: 'LI', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'LinkedIn\n432\n3.8%' } },
    { id: 'TW', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Twitter\n543\n4.8%' } },
    { id: 'SOCIAL', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Social\nMedia\n3,652\n32.1%' } },
    { id: 'CC', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Inbound\nCall Center\n1,245\n10.9%' } },
    { id: 'BLUE', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Blue\n234\n2.1%' } },
    { id: 'EV', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Events\n456\n4.0%' } },
    { id: 'LIVECHAT', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Live Chat\n312\n2.7%' } },
    { id: 'LEADS', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Leads\n11,387\n100%' } },
    { id: 'UNIQUE', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Unique\nLeads\n9,823\n86.3%' } },
    { id: 'DUP', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Duplicated\nLeads\n1,564\n13.7%', nodeStyle: redStyle } },
    { id: 'CEC_C', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'CEC\nCalled\n8,000\n81.4%' } },
    { id: 'CEC_NC', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'CEC\nNot Called\n1,823\n18.6%', nodeStyle: redStyle } },
    { id: 'ATT1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Attempt 1\n8,000\n100%' } },
    { id: 'ATT2', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Attempt 2\n5,600\n70%' } },
    { id: 'ATT3', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Attempt 3\n3,360\n42%' } },
    { id: 'WALK_LEAD', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Walking\nLeads\n876\n7.7%' } },

    // ==================== SUBFLOW 2: QUALIFICATION ====================
    { id: 'QUALIFIED', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Qualified\n7,564\n94.6%' } },
    { id: 'HOT', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Hot\nLeads\n6,688\n88.4%' } },
    { id: 'COLD', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Cold Lost\nLeads\n876\n11.6%', nodeStyle: redStyle } },
    { id: 'PASS_BRANCH', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Passed to\nBranch\n6,796\n90.6%' } },
    { id: 'R1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Reason 1\n350\n40%' } },
    { id: 'R2', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Reason 2\n306\n35%' } },
    { id: 'R3', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Reason 3\n220\n25%' } },
    { id: 'RE', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Re-engaged\n438\n50%' } },
    { id: 'NRE', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Not\nRe-engaged\n438\n50%', nodeStyle: redStyle } },

    // ==================== SUBFLOW 3: BOOKING ====================
    { id: 'SE_A', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'SE\nAssigned\n6,118\n90%' } },
    { id: 'SE_NA', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'SE Not\nAssigned\n678\n10%', nodeStyle: redStyle } },
    { id: 'OPP', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Opportunities\n4,680\n90%' } },
    { id: 'NOT_INT', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Not\nInterested\n520\n10%', nodeStyle: redStyle } },
    { id: 'SE_ACT', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'SE\nActioned\n5,200\n85%' } },
    { id: 'SE_CL', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Closed\n306\n5%', nodeStyle: redStyle } },
    { id: 'NO_ACT', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'No Action\n612\n10%', nodeStyle: redStyle } },

    // ==================== SUBFLOW 4: TEST DRIVE ====================
    { id: 'TD_BOOK', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Test Drive\nBooked\n4,212\n90%' } },
    { id: 'NO_TD', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'No Test\nDrive\n468\n10%', nodeStyle: redStyle } },
    { id: 'TD_COMP', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Completed\n3,370\n80%' } },
    { id: 'TD_RESCH', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Rescheduled\n421\n10%' } },
    { id: 'TD_CAN', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Cancelled\n421\n10%', nodeStyle: redStyle } },

    // ==================== SUBFLOW 5: ORDERING ====================
    { id: 'ORD', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Orders\n1,685\n50%' } },
    { id: 'NO_ORD', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'No Orders\n1,685\n50%', nodeStyle: redStyle } },

    // ==================== SUBFLOW 6: INVOICING ====================
    { id: 'CASH', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Cash\nPayment\n843\n50%' } },
    { id: 'FI', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'F&I\nApplications\n337\n20%' } },
    { id: 'ORD_CAN', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Cancelled\nOrders\n84\n5%', nodeStyle: redStyle } },
    { id: 'INV', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Invoices\n1,180\n70%' } },
    { id: 'APP1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Application 1\n168\n50%' } },
    { id: 'APP2', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Application 2\n101\n30%' } },
    { id: 'APP3', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Application 3\n68\n20%' } },
    { id: 'APPROVED', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Approved\n270\n80%' } },
    { id: 'REJECTED', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Rejected\n67\n20%', nodeStyle: redStyle } },
  ];
};

// Settings interface for flow configuration
interface FlowSettings {
  darkMode: boolean;
  showEdgeLabels: boolean;
  useSmoothStep: boolean;
}

// Define edges with animated dashed lines, arrow markers, and optional percentage labels
const createInitialEdges = (settings: FlowSettings): Edge[] => {
  const edgeDefaults = {
    animated: true,
    style: { strokeDasharray: '5 5' },
    markerEnd: { type: MarkerType.ArrowClosed },
    ...(settings.useSmoothStep && { type: 'smoothstep' as const }),
  };

  // Helper to create edge with optional label based on settings
  const edge = (id: string, source: string, target: string, label?: string): Edge => ({
    id,
    source,
    target,
    ...edgeDefaults,
    ...(settings.showEdgeLabels && label && { label, labelStyle: { fontSize: 8, fontWeight: 600, fill: '#475569' }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 }, labelBgPadding: [2, 4] as [number, number], labelBgBorderRadius: 2 }),
  });

  return [
    // ==================== SUBFLOW 1: LEAD SOURCING EDGES ====================
    // Organic Search & Paid Search -> Web (100% each - single destination)
    edge('e-organic-web', 'ORGANIC', 'WEB', '100%'),
    edge('e-paid-web', 'PAID', 'WEB', '100%'),

    // Social platforms -> Web, Social, CC (split 3 ways: 40% Web, 40% Social, 20% CC)
    edge('e-ig-web', 'IG', 'WEB', '40%'),
    edge('e-fb-web', 'FB', 'WEB', '40%'),
    edge('e-tk-web', 'TK', 'WEB', '40%'),
    edge('e-li-web', 'LI', 'WEB', '40%'),
    edge('e-tw-web', 'TW', 'WEB', '40%'),

    // Social platforms -> Social Media
    edge('e-ig-social', 'IG', 'SOCIAL', '40%'),
    edge('e-fb-social', 'FB', 'SOCIAL', '40%'),
    edge('e-tk-social', 'TK', 'SOCIAL', '40%'),
    edge('e-li-social', 'LI', 'SOCIAL', '40%'),
    edge('e-tw-social', 'TW', 'SOCIAL', '40%'),

    // Social platforms -> Inbound Call Center
    edge('e-ig-cc', 'IG', 'CC', '20%'),
    edge('e-fb-cc', 'FB', 'CC', '20%'),
    edge('e-tk-cc', 'TK', 'CC', '20%'),
    edge('e-li-cc', 'LI', 'CC', '20%'),
    edge('e-tw-cc', 'TW', 'CC', '20%'),

    // Aggregators -> Leads (proportional contribution)
    edge('e-web-leads', 'WEB', 'LEADS', '36%'),
    edge('e-social-leads', 'SOCIAL', 'LEADS', '32%'),
    edge('e-blue-leads', 'BLUE', 'LEADS', '2%'),
    edge('e-ev-leads', 'EV', 'LEADS', '4%'),
    edge('e-livechat-leads', 'LIVECHAT', 'LEADS', '3%'),
    edge('e-cc-leads', 'CC', 'LEADS', '11%'),

    // Leads -> Unique & Duplicated (86% unique, 14% duplicated)
    edge('e-leads-unique', 'LEADS', 'UNIQUE', '86%'),
    edge('e-leads-dup', 'LEADS', 'DUP', '14%'),

    // Unique Leads -> CEC Called & Not Called (81% called, 19% not called)
    edge('e-unique-cecc', 'UNIQUE', 'CEC_C', '81%'),
    edge('e-unique-cecnc', 'UNIQUE', 'CEC_NC', '19%'),

    // CEC Called -> Attempts (100% to Att1, then decreasing)
    edge('e-cecc-att1', 'CEC_C', 'ATT1', '100%'),
    edge('e-cecc-att2', 'CEC_C', 'ATT2', '70%'),
    edge('e-cecc-att3', 'CEC_C', 'ATT3', '42%'),

    // ==================== CROSS-SUBFLOW: LEAD SOURCING -> QUALIFICATION ====================
    // Attempts -> Qualified (decreasing success rates)
    edge('e-att1-qual', 'ATT1', 'QUALIFIED', '95%'),
    edge('e-att2-qual', 'ATT2', 'QUALIFIED', '90%'),
    edge('e-att3-qual', 'ATT3', 'QUALIFIED', '75%'),
    // Attempt 3 -> Cold Lost Leads (failed attempts)
    edge('e-att3-cold', 'ATT3', 'COLD', '25%'),

    // ==================== SUBFLOW 2: QUALIFICATION EDGES ====================
    // Qualified -> Hot & Cold (88% hot, 12% cold)
    edge('e-qual-hot', 'QUALIFIED', 'HOT', '88%'),
    edge('e-qual-cold', 'QUALIFIED', 'COLD', '12%'),

    // Hot Leads -> Passed to Branch (100%)
    edge('e-hot-branch', 'HOT', 'PASS_BRANCH', '100%'),

    // Cold Lost Leads -> Reasons (40%, 35%, 25%)
    edge('e-cold-r1', 'COLD', 'R1', '40%'),
    edge('e-cold-r2', 'COLD', 'R2', '35%'),
    edge('e-cold-r3', 'COLD', 'R3', '25%'),

    // Reasons -> Re-engaged & Not Re-engaged (50/50 split each)
    edge('e-r1-re', 'R1', 'RE', '50%'),
    edge('e-r1-nre', 'R1', 'NRE', '50%'),
    edge('e-r2-re', 'R2', 'RE', '50%'),
    edge('e-r2-nre', 'R2', 'NRE', '50%'),
    edge('e-r3-re', 'R3', 'RE', '50%'),
    edge('e-r3-nre', 'R3', 'NRE', '50%'),

    // Re-engaged -> Passed to Branch (100%)
    edge('e-re-branch', 'RE', 'PASS_BRANCH', '100%'),

    // ==================== CROSS-SUBFLOW: QUALIFICATION -> BOOKING ====================
    // Passed to Branch -> SE Assigned & Not Assigned (90% assigned, 10% not)
    edge('e-branch-sea', 'PASS_BRANCH', 'SE_A', '90%'),
    edge('e-branch-sena', 'PASS_BRANCH', 'SE_NA', '10%'),

    // ==================== SUBFLOW 3: BOOKING EDGES ====================
    // SE Assigned -> SE Actioned, Closed, No Action (85%, 5%, 10%)
    edge('e-sea-seact', 'SE_A', 'SE_ACT', '85%'),
    edge('e-sea-cl', 'SE_A', 'SE_CL', '5%'),
    edge('e-sea-noact', 'SE_A', 'NO_ACT', '10%'),

    // SE Actioned -> Opportunities & Not Interested (90%, 10%)
    edge('e-seact-opp', 'SE_ACT', 'OPP', '90%'),
    edge('e-seact-notint', 'SE_ACT', 'NOT_INT', '10%'),

    // Walking Leads -> Opportunities (100%)
    edge('e-walklead-opp', 'WALK_LEAD', 'OPP', '100%'),

    // ==================== CROSS-SUBFLOW: BOOKING -> TEST DRIVE ====================
    // Opportunities -> Test Drive Booked & No Test Drive (90%, 10%)
    edge('e-opp-tdbook', 'OPP', 'TD_BOOK', '90%'),
    edge('e-opp-notd', 'OPP', 'NO_TD', '10%'),

    // ==================== SUBFLOW 4: TEST DRIVE EDGES ====================
    // Test Drive Booked -> Completed, Rescheduled, Cancelled (80%, 10%, 10%)
    edge('e-tdbook-comp', 'TD_BOOK', 'TD_COMP', '80%'),
    edge('e-tdbook-resch', 'TD_BOOK', 'TD_RESCH', '10%'),
    edge('e-tdbook-can', 'TD_BOOK', 'TD_CAN', '10%'),
    // Rescheduled -> Test Drive Booked (loop back - 100%)
    edge('e-resch-tdbook', 'TD_RESCH', 'TD_BOOK', '100%'),

    // ==================== CROSS-SUBFLOW: TEST DRIVE -> ORDERING ====================
    // Completed -> Orders & No Orders (50%, 50%)
    edge('e-comp-ord', 'TD_COMP', 'ORD', '50%'),
    edge('e-comp-noord', 'TD_COMP', 'NO_ORD', '50%'),
    // No Test Drive -> Orders (direct purchase without test drive - 30%)
    edge('e-notd-ord', 'NO_TD', 'ORD', '30%'),

    // ==================== CROSS-SUBFLOW: ORDERING -> INVOICING ====================
    // Orders -> Cash Payment, F&I, Cancelled Orders (50%, 20%, 5%)
    edge('e-ord-cash', 'ORD', 'CASH', '50%'),
    edge('e-ord-fi', 'ORD', 'FI', '20%'),
    edge('e-ord-ordcan', 'ORD', 'ORD_CAN', '5%'),

    // Cash Payment -> Invoices (100%)
    edge('e-cash-inv', 'CASH', 'INV', '100%'),

    // ==================== SUBFLOW 6: INVOICING EDGES ====================
    // F&I Applications -> Application 1, 2, 3 (50%, 30%, 20%)
    edge('e-fi-app1', 'FI', 'APP1', '50%'),
    edge('e-fi-app2', 'FI', 'APP2', '30%'),
    edge('e-fi-app3', 'FI', 'APP3', '20%'),

    // Applications -> Approved & Rejected (80%, 20% each)
    edge('e-app1-approved', 'APP1', 'APPROVED', '80%'),
    edge('e-app1-rejected', 'APP1', 'REJECTED', '20%'),
    edge('e-app2-approved', 'APP2', 'APPROVED', '80%'),
    edge('e-app2-rejected', 'APP2', 'REJECTED', '20%'),
    edge('e-app3-approved', 'APP3', 'APPROVED', '80%'),
    edge('e-app3-rejected', 'APP3', 'REJECTED', '20%'),

    // Approved -> Invoices (100%)
    edge('e-approved-inv', 'APPROVED', 'INV', '100%'),
  ];
};

interface TestDriveProcessV2Props {
  headless?: boolean;
}

export function TestDriveProcessV2({ headless = false }: TestDriveProcessV2Props) {
  // Settings state - edge labels off by default
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settings, setSettings] = useState<FlowSettings>({
    darkMode: false,
    showEdgeLabels: false,
    useSmoothStep: false,
  });

  // Calculate layout using dagre - recalculate when settings change
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const initialNodes = createInitialNodes();
    const initialEdges = createInitialEdges(settings);
    return getLayoutedElements(initialNodes, initialEdges, 'LR');
  }, [settings]);

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [topSearchTerm, setTopSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<ProcessStage | 'all'>('all');
  const [multiStageFilter, setMultiStageFilter] = useState<ProcessStage[] | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  // Update edges when settings change
  useEffect(() => {
    setEdges(layoutedEdges);
  }, [layoutedEdges, setEdges]);

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

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Extract the label name (first line before newline)
    const labelText = node.data.label as string;
    const labelName = labelText.split('\n')[0];
    setSourceFilter(labelName);
    setStageFilter('all');
    setMultiStageFilter(null);
    setIsDrawerOpen(true);
  }, []);

  // Handle stage area click
  const handleStageAreaClick = (filterStages: ProcessStage[]) => {
    setStageFilter('all');
    setMultiStageFilter(filterStages);
    setSourceFilter(null);
    setIsDrawerOpen(true);
  };

  // Filter leads for drawer
  const filteredLeads = mockLeads.filter(lead => {
    if (sourceFilter && !lead.source.toLowerCase().includes(sourceFilter.toLowerCase())) {
      return false;
    }
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

  return (
    <div className={`test-drive-process-v2 ${headless ? 'headless' : ''}`}>
      {/* Main content area */}
      <div className="process-main-content">
        <div className="chart-container">
          {/* Overlay Search Bar */}
          <div className="overlay-search-container">
            <div className="overlay-search-wrapper">
              <Search className="overlay-search-icon" size={16} />
              <Input
                type="text"
                placeholder="Find specific lead by Lead ID, Phone Number or Name"
                value={topSearchTerm}
                onChange={(e) => setTopSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && topSearchTerm.trim()) {
                    setSearchTerm(topSearchTerm);
                    setStageFilter('all');
                    setMultiStageFilter(null);
                    setSourceFilter(null);
                    setIsDrawerOpen(true);
                  }
                }}
                className="overlay-search-input"
              />
            </div>
            <button
              className="view-all-leads-btn"
              onClick={() => {
                setSearchTerm('');
                setTopSearchTerm('');
                setStageFilter('all');
                setMultiStageFilter(null);
                setSourceFilter(null);
                setIsDrawerOpen(true);
              }}
            >
              View all leads
            </button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.05 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            className={settings.darkMode ? 'dark-mode' : ''}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          {/* Settings Button */}
          <button
            className="settings-btn"
            onClick={() => setShowSettingsDialog(true)}
            title="Settings"
          >
            <Settings size={16} />
          </button>

          {/* Settings Dialog */}
          {showSettingsDialog && (
            <div className="settings-dialog-overlay" onClick={() => setShowSettingsDialog(false)}>
              <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="settings-dialog-header">
                  <h3>Flow Settings</h3>
                  <button
                    className="settings-close-btn"
                    onClick={() => setShowSettingsDialog(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="settings-dialog-content">
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                    />
                    <span className="toggle-label">Dark Mode</span>
                    <span className="toggle-description">Enable dark theme for the flow canvas</span>
                  </label>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showEdgeLabels}
                      onChange={(e) => setSettings(prev => ({ ...prev, showEdgeLabels: e.target.checked }))}
                    />
                    <span className="toggle-label">Edge with Node Data</span>
                    <span className="toggle-description">Show percentage labels on edges</span>
                  </label>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={settings.useSmoothStep}
                      onChange={(e) => setSettings(prev => ({ ...prev, useSmoothStep: e.target.checked }))}
                    />
                    <span className="toggle-label">Smooth Step Edges</span>
                    <span className="toggle-description">Use smooth step style for edges</span>
                  </label>
                </div>
              </div>
            </div>
          )}
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

export default TestDriveProcessV2;
