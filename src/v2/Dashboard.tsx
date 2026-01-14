import { useState, useMemo, useEffect } from "react"
import { Activity, Settings, X, Plus } from "lucide-react"

import { SalesFunnel } from "../test_drive/components/SalesFunnel"
import { Leaderboard } from "../test_drive/components/Leaderboard"
import { FilterBar, type GlobalFilters } from "../test_drive/components/FilterBar"
import { ChannelPerformance } from "../test_drive/components/ChannelPerformance"
import { ChannelConversion } from "../test_drive/components/ChannelConversion"
import { TimeToTestDrive } from "../test_drive/components/TimeToTestDrive"
import { TestDrivesNeededBar } from "../test_drive/components/TestDrivesNeededBar"
import { DurationByModel } from "../test_drive/components/DurationByModel"
import { LeaderboardScatter } from "../test_drive/components/LeaderboardScatter"
import { TestDrivesByModelVertical } from "../test_drive/components/TestDrivesByModelVertical"
import { TestDrivesOverTime } from "../test_drive/components/TestDrivesOverTime"
import { TestDriveCompletion } from "../test_drive/components/TestDriveCompletion"
import { OccurrenceRadial } from "../test_drive/components/OccurrenceRadial"
import { OccurrenceHeatmap } from "../test_drive/components/OccurrenceHeatmap"
import { DemographicsGender } from "../test_drive/components/DemographicsGender"
import { DemographicsAge } from "../test_drive/components/DemographicsAge"
import { TopModelsPreference } from "../test_drive/components/TopModelsPreference"
import { TopChannelsPreference } from "../test_drive/components/TopChannelsPreference"
import { TopShowroomsPreference } from "../test_drive/components/TopShowroomsPreference"
import { CustomerInsights } from "../test_drive/components/CustomerInsights"
import { LiveTestDrives } from "../test_drive/components/LiveTestDrives"
import { TestDriveProcess } from "../test_drive/components/TestDriveProcess"

import { LEXUS_MODELS, UAE_SHOWROOMS_DATA, LEAD_SOURCES, popularModelsWithFunnelData, demographicsByAgeGender, genderByAgeData, modelPreferencesData, channelPreferencesData, showroomPreferencesData } from "../test_drive/data/mockData"

import './Dashboard.css'

// Layout templates available for creating new tabs
const LAYOUT_TEMPLATES = [
  { id: 'layout1', name: 'Layout 1', description: '2 small + 1 tall right + 1 wide bottom' },
  { id: 'layout2', name: 'Layout 2', description: '6 equal cards (3x2)' },
  { id: 'layout3', name: 'Layout 3', description: '3 cards top + 1 full width bottom' },
  { id: 'layout4', name: 'Layout 4', description: '1 full width top + 3 cards bottom' },
  { id: 'layout5', name: 'Layout 5', description: 'Wide top-left + tall right + 2 bottom' },
  { id: 'layout6', name: 'Layout 6', description: 'Tall left + 2 top-right + wide bottom-right' },
  { id: 'layout7', name: 'Layout 7', description: 'Large left (2/3) + 2 stacked right' },
  { id: 'layout8', name: 'Layout 8', description: '3 equal tall columns' },
  { id: 'layout9', name: 'Layout 9', description: 'Tall left + 2x2 grid right' },
  { id: 'layout10', name: 'Layout 10', description: 'Tall left + 2 stacked center + tall right' },
  { id: 'layout11', name: 'Layout 11', description: '1 single large card' },
  { id: 'layout12', name: 'Layout 12', description: '2 equal tall columns side by side' },
  { id: 'layout13', name: 'Layout 13', description: 'Tall left + 2 top-right + wide bottom-right' },
  { id: 'layout14', name: 'Layout 14', description: 'Wide top-left + 2 bottom-left + tall right' },
  { id: 'layout15', name: 'Layout 15', description: '2 large top + 4 small bottom' },
  { id: 'layout16', name: 'Layout 16', description: '2x2 grid left + 1 tall right' },
] as const

type LayoutTemplateId = typeof LAYOUT_TEMPLATES[number]['id']

// Base tabs (non-removable)
const BASE_TABS = [
  { id: 'testdriveprocess', label: 'Overview', shortLabel: 'Overview', isCustom: false },
  { id: 'executive', label: 'Executive Summary', shortLabel: 'KPIs', isCustom: false },
  { id: 'v2funnel', label: 'Sales Funnel', shortLabel: 'Funnel', isCustom: false },
  { id: 'v2opsperformance', label: 'Operational Performance', shortLabel: 'OpsPerf', isCustom: false },
  { id: 'carmodel', label: 'Car Model Performance', shortLabel: 'Models', isCustom: false },
  { id: 'leaderboards', label: 'Leaderboards', shortLabel: 'Leaders', isCustom: false },
  { id: 'v2demographics', label: 'Customer Insights', shortLabel: 'Insights', isCustom: false },
] as const

interface CustomTab {
  id: string
  label: string
  shortLabel: string
  layoutId: LayoutTemplateId
  isCustom: true
}

type Tab = typeof BASE_TABS[number] | CustomTab

// Sample leaderboard data for showrooms
const showroomLeaderboardData = [
  { name: 'DFC', value: 1245, conversions: 149, conversionRate: 12.0 },
  { name: 'Sheikh Zayed Road', value: 1089, conversions: 141, conversionRate: 13.0 },
  { name: 'Abu Dhabi', value: 892, conversions: 107, conversionRate: 12.0 },
  { name: 'Sharjah', value: 756, conversions: 83, conversionRate: 11.0 },
  { name: 'Al Ain', value: 634, conversions: 76, conversionRate: 12.0 },
  { name: 'DIP', value: 521, conversions: 57, conversionRate: 10.9 },
  { name: 'Ras Al Khaimah', value: 412, conversions: 49, conversionRate: 11.9 },
  { name: 'Ajman', value: 356, conversions: 39, conversionRate: 11.0 },
  { name: 'Fujairah', value: 234, conversions: 26, conversionRate: 11.1 },
]

// Sample leaderboard data for sales consultants
const consultantLeaderboardData = [
  { name: 'Ahmed Al Rashid', value: 245, conversions: 34, conversionRate: 13.9 },
  { name: 'Mohammed Hassan', value: 223, conversions: 29, conversionRate: 13.0 },
  { name: 'Sarah Ibrahim', value: 198, conversions: 28, conversionRate: 14.1 },
  { name: 'Omar Khalil', value: 187, conversions: 24, conversionRate: 12.8 },
  { name: 'Fatima Al Qasim', value: 176, conversions: 25, conversionRate: 14.2 },
  { name: 'Youssef Mahmoud', value: 165, conversions: 20, conversionRate: 12.1 },
  { name: 'Layla Ahmed', value: 154, conversions: 19, conversionRate: 12.3 },
  { name: 'Hassan Ali', value: 143, conversions: 17, conversionRate: 11.9 },
  { name: 'Nadia Farooq', value: 138, conversions: 18, conversionRate: 13.0 },
  { name: 'Tariq Al Mualla', value: 132, conversions: 15, conversionRate: 11.4 },
  { name: 'Amira Saeed', value: 127, conversions: 17, conversionRate: 13.4 },
  { name: 'Majid Al Falasi', value: 121, conversions: 14, conversionRate: 11.6 },
  { name: 'Salma Rashid', value: 115, conversions: 16, conversionRate: 13.9 },
  { name: 'Karim Abdullah', value: 109, conversions: 12, conversionRate: 11.0 },
  { name: 'Dina Al Hashimi', value: 103, conversions: 14, conversionRate: 13.6 },
  { name: 'Waleed Jasim', value: 98, conversions: 11, conversionRate: 11.2 },
]

// Sample leaderboard data for call center agents
const callCenterLeaderboardData = [
  { name: 'Mariam Al Suwaidi', value: 312, conversions: 47, conversionRate: 15.1 },
  { name: 'Khalid Nasser', value: 287, conversions: 40, conversionRate: 13.9 },
  { name: 'Noura Ahmed', value: 265, conversions: 37, conversionRate: 14.0 },
  { name: 'Saeed Al Maktoum', value: 243, conversions: 32, conversionRate: 13.2 },
  { name: 'Huda Khalifa', value: 221, conversions: 31, conversionRate: 14.0 },
  { name: 'Rashed Omar', value: 198, conversions: 26, conversionRate: 13.1 },
  { name: 'Aisha Mansoor', value: 176, conversions: 25, conversionRate: 14.2 },
  { name: 'Faisal Al Hamad', value: 154, conversions: 19, conversionRate: 12.3 },
  { name: 'Jamila Al Zaabi', value: 148, conversions: 21, conversionRate: 14.2 },
  { name: 'Yasser Hakim', value: 142, conversions: 18, conversionRate: 12.7 },
  { name: 'Maha Al Ketbi', value: 136, conversions: 20, conversionRate: 14.7 },
  { name: 'Ibrahim Suleiman', value: 129, conversions: 16, conversionRate: 12.4 },
  { name: 'Lina Qasim', value: 123, conversions: 18, conversionRate: 14.6 },
  { name: 'Adel Al Shamsi', value: 117, conversions: 14, conversionRate: 12.0 },
  { name: 'Reema Yousef', value: 111, conversions: 16, conversionRate: 14.4 },
  { name: 'Zayed Al Nuaimi', value: 105, conversions: 12, conversionRate: 11.4 },
]

const defaultFilters: GlobalFilters = {
  startDate: null,
  endDate: null,
  model: null,
  showroom: null,
  channel: null,
}

// Layout preview component for the dialog
function LayoutPreview({ layoutId }: { layoutId: LayoutTemplateId }) {
  const getPreviewContent = () => {
    switch (layoutId) {
      case 'layout1':
        return (
          <div className="layout-preview layout1-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card tall"></div>
            <div className="preview-card wide"></div>
          </div>
        )
      case 'layout2':
        return (
          <div className="layout-preview layout2-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout3':
        return (
          <div className="layout-preview layout3-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card full-width"></div>
          </div>
        )
      case 'layout4':
        return (
          <div className="layout-preview layout4-preview">
            <div className="preview-card full-width"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout5':
        return (
          <div className="layout-preview layout5-preview">
            <div className="preview-card"></div>
            <div className="preview-card tall"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout6':
        return (
          <div className="layout-preview layout6-preview">
            <div className="preview-card tall"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card wide"></div>
          </div>
        )
      case 'layout7':
        return (
          <div className="layout-preview layout7-preview">
            <div className="preview-card large"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout8':
        return (
          <div className="layout-preview layout8-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout9':
        return (
          <div className="layout-preview layout9-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout10':
        return (
          <div className="layout-preview layout10-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout11':
        return (
          <div className="layout-preview layout11-preview">
            <div className="preview-card"></div>
          </div>
        )
      case 'layout12':
        return (
          <div className="layout-preview layout12-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout13':
        return (
          <div className="layout-preview layout13-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout14':
        return (
          <div className="layout-preview layout14-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout15':
        return (
          <div className="layout-preview layout15-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      case 'layout16':
        return (
          <div className="layout-preview layout16-preview">
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
            <div className="preview-card"></div>
          </div>
        )
      default:
        return null
    }
  }

  return getPreviewContent()
}

const STORAGE_KEY = 'v2-dashboard-custom-tabs'

// Load custom tabs from localStorage
const loadCustomTabs = (): CustomTab[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load custom tabs from localStorage:', e)
  }
  return []
}

// Save custom tabs to localStorage
const saveCustomTabs = (tabs: CustomTab[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
  } catch (e) {
    console.error('Failed to save custom tabs to localStorage:', e)
  }
}

export function V2Dashboard() {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters)
  const [activeTab, setActiveTab] = useState<string>('testdriveprocess')
  const [customTabs, setCustomTabs] = useState<CustomTab[]>(loadCustomTabs)
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState<LayoutTemplateId | null>(null)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState<string>('')
  const [isLiveDataActive, setIsLiveDataActive] = useState(false)
  const [selectedLeadSource, setSelectedLeadSource] = useState<string | null>(null)

  // Selection states for leaderboards
  const [selectedCallCenter, setSelectedCallCenter] = useState<string | null>(null)
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null)
  const [selectedShowroom, setSelectedShowroom] = useState<string | null>(null)

  // Selection states for demographics (cross-chart filtering)
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null)

  // Save custom tabs to localStorage whenever they change
  useEffect(() => {
    saveCustomTabs(customTabs)
  }, [customTabs])

  // Combine base tabs with custom tabs
  const allTabs: Tab[] = useMemo(() => [...BASE_TABS, ...customTabs], [customTabs])

  // Get showroom names for FilterBar
  const showroomNames = useMemo(() => UAE_SHOWROOMS_DATA.map(s => s.shortName), [])

  // Compute gender data for donut chart (changes when age group is selected)
  const genderChartData = useMemo(() => {
    if (selectedAgeGroup) {
      // Show gender breakdown for the selected age group
      const ageData = genderByAgeData[selectedAgeGroup]
      if (ageData) {
        return ageData.map(d => ({
          gender: d.gender.toLowerCase() as 'male' | 'female',
          count: d.count
        }))
      }
    }
    // Default: show total gender distribution
    const totalMale = demographicsByAgeGender.reduce((sum, d) => sum + d.male, 0)
    const totalFemale = demographicsByAgeGender.reduce((sum, d) => sum + d.female, 0)
    return [
      { gender: 'male' as const, count: totalMale },
      { gender: 'female' as const, count: totalFemale }
    ]
  }, [selectedAgeGroup])

  // Age chart data is always the full breakdown (filtering handled in component)
  const ageChartData = useMemo(() => {
    return demographicsByAgeGender.map(d => ({
      ageGroup: d.ageGroup,
      male: d.male,
      female: d.female,
      total: d.total
    }))
  }, [])

  // Add a new custom tab
  const handleAddTab = () => {
    if (!selectedLayout) return

    const newTabNumber = customTabs.length + 1
    const newTab: CustomTab = {
      id: `custom-${Date.now()}`,
      label: `Custom ${newTabNumber}`,
      shortLabel: `C${newTabNumber}`,
      layoutId: selectedLayout,
      isCustom: true,
    }

    setCustomTabs([...customTabs, newTab])
    setActiveTab(newTab.id)
    setIsLayoutDialogOpen(false)
    setSelectedLayout(null)
  }

  // Remove a custom tab
  const handleRemoveTab = (tabId: string) => {
    setCustomTabs(customTabs.filter(t => t.id !== tabId))
    if (activeTab === tabId) {
      setActiveTab('testdriveprocess')
    }
  }

  // Start editing a tab name
  const handleStartEditing = (tab: CustomTab) => {
    setEditingTabId(tab.id)
    setEditingTabName(tab.label)
  }

  // Save the edited tab name
  const handleSaveTabName = () => {
    if (editingTabId && editingTabName.trim()) {
      setCustomTabs(customTabs.map(t =>
        t.id === editingTabId
          ? { ...t, label: editingTabName.trim(), shortLabel: editingTabName.trim().substring(0, 8) }
          : t
      ))
    }
    setEditingTabId(null)
    setEditingTabName('')
  }

  // Cancel editing
  const handleCancelEditing = () => {
    setEditingTabId(null)
    setEditingTabName('')
  }

  // Render layout content for custom tabs
  const renderLayoutContent = (layoutId: LayoutTemplateId) => {
    switch (layoutId) {
      case 'layout1':
        return (
          <div className="tab-content-grid layout1-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card tall">Card 3</div>
            <div className="placeholder-card wide">Card 4</div>
          </div>
        )
      case 'layout2':
        return (
          <div className="tab-content-grid layout2-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
            <div className="placeholder-card">Card 5</div>
            <div className="placeholder-card">Card 6</div>
          </div>
        )
      case 'layout3':
        return (
          <div className="tab-content-grid layout3-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card full-width">Card 4</div>
          </div>
        )
      case 'layout4':
        return (
          <div className="tab-content-grid layout4-grid">
            <div className="placeholder-card full-width">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
          </div>
        )
      case 'layout5':
        return (
          <div className="tab-content-grid layout5-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card tall">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
          </div>
        )
      case 'layout6':
        return (
          <div className="tab-content-grid layout6-grid">
            <div className="placeholder-card tall">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card wide">Card 4</div>
          </div>
        )
      case 'layout7':
        return (
          <div className="tab-content-grid layout7-grid">
            <div className="placeholder-card large">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
          </div>
        )
      case 'layout8':
        return (
          <div className="tab-content-grid layout8-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
          </div>
        )
      case 'layout9':
        return (
          <div className="tab-content-grid layout9-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
            <div className="placeholder-card">Card 5</div>
          </div>
        )
      case 'layout10':
        return (
          <div className="tab-content-grid layout10-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
          </div>
        )
      case 'layout11':
        return (
          <div className="tab-content-grid layout11-grid">
            <div className="placeholder-card">Card 1</div>
          </div>
        )
      case 'layout12':
        return (
          <div className="tab-content-grid layout12-grid">
            <div className="placeholder-card">
              <Leaderboard
                headless
                title="Call Center Leaderboard"
                subtitle="By appointments booked"
                data={callCenterLeaderboardData}
                valueLabel="Appointments"
              />
            </div>
            <div className="placeholder-card layout12-stacked">
              <Leaderboard
                headless
                title="Sales Executive Leaderboard"
                subtitle="By test drives completed"
                data={consultantLeaderboardData}
                valueLabel="Test Drives"
              />
              <Leaderboard
                headless
                title="Showrooms Leaderboard"
                subtitle="By test drive volume"
                data={showroomLeaderboardData}
                valueLabel="Test Drives"
              />
            </div>
          </div>
        )
      case 'layout13':
        return (
          <div className="tab-content-grid layout13-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
          </div>
        )
      case 'layout14':
        return (
          <div className="tab-content-grid layout14-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
          </div>
        )
      case 'layout15':
        return (
          <div className="tab-content-grid layout15-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
            <div className="placeholder-card">Card 5</div>
            <div className="placeholder-card">Card 6</div>
          </div>
        )
      case 'layout16':
        return (
          <div className="tab-content-grid layout16-grid">
            <div className="placeholder-card">Card 1</div>
            <div className="placeholder-card">Card 2</div>
            <div className="placeholder-card">Card 3</div>
            <div className="placeholder-card">Card 4</div>
            <div className="placeholder-card">Card 5</div>
          </div>
        )
      default:
        return null
    }
  }

  const renderTabContent = () => {
    // Check if it's a custom tab
    const customTab = customTabs.find(t => t.id === activeTab)
    if (customTab) {
      return renderLayoutContent(customTab.layoutId)
    }

    // Base tabs
    switch (activeTab) {
      case 'executive':
        return isLiveDataActive ? (
          // Layout 16: 2x2 grid left + 1 tall right (with Live Data)
          <div className="tab-content-grid layout16-grid">
            <div className="placeholder-card">
              <OccurrenceRadial />
            </div>
            <div className="placeholder-card">
              <TestDriveCompletion />
            </div>
            <div className="placeholder-card">
              <TestDrivesOverTime filters={filters} />
            </div>
            <div className="placeholder-card">
              <OccurrenceHeatmap />
            </div>
            <div className="placeholder-card">
              <LiveTestDrives headless />
            </div>
          </div>
        ) : (
          // Layout 5: Wide top-left + 2 bottom + tall right (default)
          <div className="tab-content-grid layout5-grid">
            <div className="placeholder-card">
              <TestDrivesOverTime filters={filters} />
            </div>
            <div className="placeholder-card">
              <OccurrenceRadial />
            </div>
            <div className="placeholder-card">
              <TestDriveCompletion />
            </div>
            <div className="placeholder-card">
              <OccurrenceHeatmap />
            </div>
          </div>
        )

      case 'v2funnel':
        return (
          <div className="tab-content-grid layout10-grid">
            <div className="placeholder-card">
              <SalesFunnel
                headless
                selectedSource={selectedLeadSource}
                onSourceSelect={setSelectedLeadSource}
              />
            </div>
            <div className="placeholder-card">
              <ChannelPerformance
                headless
                selectedSource={selectedLeadSource}
                onSourceSelect={setSelectedLeadSource}
              />
            </div>
            <div className="placeholder-card">
              <ChannelConversion
                headless
                selectedSource={selectedLeadSource}
                onSourceSelect={setSelectedLeadSource}
              />
            </div>
            <div className="placeholder-card insights-card">
              <div className="insights-content">
                <h3>Performance Insights</h3>
                <div className="insight-item">
                  <span className="insight-label">Funnel Conversion Rate</span>
                  <span className="insight-value positive">12.4%</span>
                  <p className="insight-detail">Overall conversion from lead to sale is performing 2.1% above target. The strongest conversion occurs at the test drive to negotiation stage.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Top Performing Channel</span>
                  <span className="insight-value">Lexus Website</span>
                  <p className="insight-detail">Digital leads convert at 14.0%, outperforming walk-ins (13.0%) and phone inquiries (11.0%). Consider increasing digital marketing spend.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Opportunity</span>
                  <span className="insight-value warning">Social Media</span>
                  <p className="insight-detail">Social media leads show high volume but lower conversion (11.0%). Review lead quality and follow-up processes for this channel.</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'carmodel':
        return (
          <div className="tab-content-grid carmodel-grid">
            <div className="placeholder-card">
              <TestDrivesByModelVertical data={popularModelsWithFunnelData} headless />
            </div>
            <div className="placeholder-card insights-card">
              <div className="insights-content">
                <h3>Model Insights</h3>
                <div className="insight-item">
                  <span className="insight-label">Top Performing Model</span>
                  <span className="insight-value positive">RX350</span>
                  <p className="insight-detail">RX350 leads with 1,245 test drives and a 12.4% conversion rate. Strong demand across all showrooms indicates sustained customer interest in mid-size luxury SUVs.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Highest Conversion</span>
                  <span className="insight-value">LC500</span>
                  <p className="insight-detail">Performance models show the highest conversion rates at 15.2%. Customers test driving LC500 and RC F are highly qualified buyers with strong purchase intent.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Growth Opportunity</span>
                  <span className="insight-value warning">ES300h</span>
                  <p className="insight-detail">ES300h has high lead volume but lower booking-to-completion ratio (68%). Review follow-up processes to capture more qualified leads for this popular sedan.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">SUV Category Share</span>
                  <span className="insight-value">62%</span>
                  <p className="insight-detail">SUVs dominate test drive requests with 62% of total volume. NX and RX series account for the majority of SUV interest.</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'v2opsperformance':
        return (
          <div className="tab-content-grid layout14-grid">
            <div className="placeholder-card">
              <TestDrivesNeededBar headless />
            </div>
            <div className="placeholder-card">
              <TimeToTestDrive headless />
            </div>
            <div className="placeholder-card">
              <DurationByModel headless />
            </div>
            <div className="placeholder-card insights-card">
              <div className="insights-content">
                <h3>Operational Insights</h3>
                <div className="insight-item">
                  <span className="insight-label">Test Drive Efficiency</span>
                  <span className="insight-value positive">78%</span>
                  <p className="insight-detail">Most customers (78%) complete their purchase after just 1 test drive, indicating strong sales readiness and effective customer qualification.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Fastest Showroom</span>
                  <span className="insight-value">DFC</span>
                  <p className="insight-detail">DFC leads with an average of 1.8 days from lead to test drive. Consider replicating their scheduling processes across other locations.</p>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Duration Optimization</span>
                  <span className="insight-value warning">LX 600</span>
                  <p className="insight-detail">LX 600 test drives average 45 minutes, the longest across models. Review route planning to optimize without compromising experience.</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'leaderboards':
        return (
          <div className="tab-content-grid layout8-grid">
            <div className="placeholder-card leaderboard-with-scatter">
              <Leaderboard
                headless
                title="Call Center Agents"
                data={callCenterLeaderboardData}
                valueLabel="Appointments"
                selectedName={selectedCallCenter}
                onSelectName={setSelectedCallCenter}
              />
              <LeaderboardScatter
                data={callCenterLeaderboardData}
                valueLabel="Appointments"
                selectedName={selectedCallCenter}
                onSelect={setSelectedCallCenter}
              />
            </div>
            <div className="placeholder-card leaderboard-with-scatter">
              <Leaderboard
                headless
                title="Sales Executives"
                data={consultantLeaderboardData}
                valueLabel="Test Drives"
                selectedName={selectedConsultant}
                onSelectName={setSelectedConsultant}
              />
              <LeaderboardScatter
                data={consultantLeaderboardData}
                valueLabel="Test Drives"
                selectedName={selectedConsultant}
                onSelect={setSelectedConsultant}
              />
            </div>
            <div className="placeholder-card leaderboard-with-scatter">
              <Leaderboard
                headless
                title="Showrooms"
                data={showroomLeaderboardData}
                valueLabel="Test Drives"
                selectedName={selectedShowroom}
                onSelectName={setSelectedShowroom}
              />
              <LeaderboardScatter
                data={showroomLeaderboardData}
                valueLabel="Test Drives"
                selectedName={selectedShowroom}
                onSelect={setSelectedShowroom}
              />
            </div>
          </div>
        )

      case 'v2demographics':
        return (
          <div className="tab-content-grid layout15-grid">
            <div className="placeholder-card">
              <DemographicsGender
                data={genderChartData}
                selectedGender={selectedGender}
                onGenderSelect={setSelectedGender}
                headless
              />
            </div>
            <div className="placeholder-card">
              <DemographicsAge
                data={ageChartData}
                selectedAgeGroup={selectedAgeGroup}
                selectedGender={selectedGender}
                onAgeGroupSelect={setSelectedAgeGroup}
                headless
              />
            </div>
            <div className="placeholder-card">
              <TopModelsPreference data={modelPreferencesData} headless />
            </div>
            <div className="placeholder-card">
              <TopChannelsPreference data={channelPreferencesData} headless />
            </div>
            <div className="placeholder-card">
              <TopShowroomsPreference data={showroomPreferencesData} headless />
            </div>
            <div className="placeholder-card">
              <CustomerInsights headless />
            </div>
          </div>
        )

      case 'testdriveprocess':
        return (
          <div className="tab-content-grid layout11-grid">
            <div className="placeholder-card">
              <TestDriveProcess headless />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="v2-dashboard">
      {/* Fixed Header */}
      <header className="v2-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/lexus_logo.png" alt="Lexus" className="header-logo" />
          </div>
          <div className="header-center">
            <div className="header-title">
              <h1>Test Drive Command Center</h1>
            </div>
          </div>
          <div className="header-right">
            <button
              className={`live-data-button ${isLiveDataActive ? 'active' : ''}`}
              onClick={() => setIsLiveDataActive(!isLiveDataActive)}
              title={isLiveDataActive ? 'Disable Live Data' : 'Enable Live Data'}
            >
              <Activity className="h-3 w-3" />
              Live Data
            </button>
            <button
              className="settings-button"
              onClick={() => setIsLayoutDialogOpen(true)}
              title="Add new tab"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Filter Bar */}
      <div className="v2-filters">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          models={LEXUS_MODELS}
          showrooms={showroomNames}
          channels={LEAD_SOURCES}
        />
      </div>

      {/* Tab Navigation */}
      <nav className="v2-tabs">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${editingTabId === tab.id ? 'editing' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onDoubleClick={() => {
              if (tab.isCustom) {
                handleStartEditing(tab as CustomTab)
              }
            }}
          >
            {editingTabId === tab.id ? (
              <input
                type="text"
                className="tab-edit-input"
                value={editingTabName}
                onChange={(e) => setEditingTabName(e.target.value)}
                onBlur={handleSaveTabName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTabName()
                  } else if (e.key === 'Escape') {
                    handleCancelEditing()
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <>
                <span className="tab-label-full">{tab.label}</span>
                <span className="tab-label-short">{tab.shortLabel}</span>
              </>
            )}
            {tab.isCustom && editingTabId !== tab.id && (
              <span
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveTab(tab.id)
                }}
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Scrollable Content Area */}
      <main className="v2-content tabBody">
        {renderTabContent()}
      </main>

      {/* Layout Selection Dialog */}
      {isLayoutDialogOpen && (
        <div className="dialog-overlay" onClick={() => setIsLayoutDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Choose a Layout</h2>
              <button
                className="dialog-close"
                onClick={() => setIsLayoutDialogOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="dialog-body">
              <div className="layout-grid">
                {LAYOUT_TEMPLATES.map((layout) => (
                  <div
                    key={layout.id}
                    className={`layout-option ${selectedLayout === layout.id ? 'selected' : ''}`}
                    onClick={() => setSelectedLayout(layout.id)}
                  >
                    <div className="layout-option-preview">
                      <LayoutPreview layoutId={layout.id} />
                    </div>
                    <div className="layout-option-info">
                      <span className="layout-option-name">{layout.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dialog-footer">
              <button
                className="add-tab-button"
                onClick={handleAddTab}
                disabled={!selectedLayout}
              >
                <Plus className="h-4 w-4" />
                Add +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default V2Dashboard
