import { useRef, useEffect } from 'react';
import mermaid from 'mermaid';
import './TestDriveProcess.css';

// Initialize mermaid with custom theme
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
    fontSize: '12px',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'linear',
    nodeSpacing: 30,
    rankSpacing: 40,
    padding: 10,
  },
});

// Mermaid flowchart definition - transposed to horizontal (left to right)
const chartDefinition = `
flowchart LR
    %% Lead Sources - Row 1
    CC[Call center<br/>inbound]
    IG[Instagram]
    FB[Facebook]
    GO[Google]
    EV[Events]
    CRM[CRM]
    OOH[OOH]

    %% Secondary Sources
    WEB[Website]
    WALK[Walk-in]

    %% Main Flow
    LEADS[Leads]

    %% CEC Stage
    CEC_NC[CEC – Not<br/>called yet]:::orange
    CEC_C[CEC - Called]

    %% Lead Classification
    COLD[Cold Lost leads]:::orange
    HOT[Hot leads]

    %% Reasons
    R1[Reason 1]
    R2[Reason 2]
    R3[Reason 3]

    %% Re-engagement
    NRE[Not re-<br/>engaged]:::orange
    RE[Re-engaged]

    %% SM Assignment
    SM_NA[SM not yet<br/>assigned]:::orange
    SM_A[Pass to Branch – SM Assigned]

    %% SE Stage
    SE_CL[SE closed]:::orange
    NO_ACT[No action]:::orange
    SE_ACT[SE Action]

    %% Opportunities
    NOT_INT[Not<br/>interst.]:::orange
    OPP[Opportunities]

    %% Test Drive
    NO_TD[No test drive]:::orange
    TD[Test drive]

    %% Orders
    ORD_CAN[Orders<br/>cancelled]:::orange
    NO_ORD[No order]:::orange
    ORD[Orders]

    %% Final
    NO_INV[No<br/>invoice]:::orange
    INV[Invoices<br/>cash, lease, finance]

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

    %% Styling
    classDef default fill:#3B5998,stroke:#2D4373,stroke-width:2px,color:#FFFFFF
    classDef orange fill:#E5A853,stroke:#C88B32,stroke-width:2px,color:#FFFFFF
`;

interface TestDriveProcessProps {
  headless?: boolean;
}

export function TestDriveProcess({ headless = false }: TestDriveProcessProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
          svgElement.style.height = '100%';
          svgElement.style.maxWidth = '100%';
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
      {!headless && (
        <div className="chart-header">
          <h3 className="chart-title">Test Drive Process Flow</h3>
        </div>
      )}
      <div className="chart-container" ref={containerRef}>
        <div className="loading-placeholder">Loading chart...</div>
      </div>
    </div>
  );
}

export default TestDriveProcess;
