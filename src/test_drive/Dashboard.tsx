import { useState, useMemo } from "react"
import {
  Car,
  TrendingUp,
  Activity,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { SalesFunnel } from "./components/SalesFunnel"
import { OccurrenceRadial } from "./components/OccurrenceRadial"
import { PopulationSunburst } from "./components/PopulationSunburst"
import { TestDrivesOverTime } from "./components/TestDrivesOverTime"
import { DemographicsChart } from "./components/DemographicsChart"
import { Leaderboard } from "./components/Leaderboard"
import { FilterBar, type GlobalFilters } from "./components/FilterBar"
import { ChannelPerformance } from "./components/ChannelPerformance"
import { TestDriveCompletion } from "./components/TestDriveCompletion"
import { PopularModels } from "./components/PopularModels"
import { ConversionHeatmap } from "./components/ConversionHeatmap"
import { TestDrivesNeeded } from "./components/TestDrivesNeeded"
import { TimeToTestDrive } from "./components/TimeToTestDrive"
import { DurationByModel } from "./components/DurationByModel"
import { OccurrenceHeatmap } from "./components/OccurrenceHeatmap"
import { TestDrivesByModel } from "./components/TestDrivesByModel"
import { TestDriveProcessV2 } from "./components/TestDriveProcessV2"

import { LEXUS_MODELS, UAE_SHOWROOMS_DATA, LEAD_SOURCES } from "./data/mockData"

// Summary stats from mock data
const summaryStats = {
  totalTestDrives: 6514,
  completionRate: 80.0,
  conversionRate: 12.4,
  avgWaitDays: 2.8,
}

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
]

const defaultFilters: GlobalFilters = {
  startDate: null,
  endDate: null,
  model: null,
  showroom: null,
  channel: null,
}

export function TestDriveDashboard() {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);

  // Convert GlobalFilters to ensure correct types
  const simpleFilters = useMemo(() => ({
    startDate: filters.startDate ?? null,
    endDate: filters.endDate ?? null,
    model: filters.model ?? null,
    showroom: filters.showroom ?? null,
    channel: filters.channel ?? null,
  }), [filters]);

  // Get showroom names for FilterBar
  const showroomNames = useMemo(() => UAE_SHOWROOMS_DATA.map(s => s.shortName), []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test Drive Command Center</h1>
          <p className="text-muted-foreground">
            Lexus UAE - Real-time test drive analytics and performance tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Activity className="mr-1 h-3 w-3" />
            Live Data
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        models={LEXUS_MODELS}
        showrooms={showroomNames}
        channels={LEAD_SOURCES}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Drives</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalTestDrives.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.avgWaitDays} days</div>
            <p className="text-xs text-muted-foreground">
              -0.3 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="overview-v2">Overview V2</TabsTrigger>
          <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Attendance Chart */}
            <Card className="p-0 overflow-hidden">
              <OccurrenceRadial filters={simpleFilters} />
            </Card>

            {/* World Population Sunburst */}
            <Card className="p-0 overflow-hidden">
              <PopulationSunburst />
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Test Drive Completion */}
            <Card className="p-0 overflow-hidden">
              <TestDriveCompletion />
            </Card>
          </div>

          {/* Test Drives Needed */}
          <Card className="p-0 overflow-hidden">
            <TestDrivesNeeded />
          </Card>

          {/* Time Series Chart - Full Width */}
          <Card className="p-0 overflow-hidden">
            <TestDrivesOverTime filters={simpleFilters} />
          </Card>
        </TabsContent>

        {/* Overview V2 Tab - React Flow */}
        <TabsContent value="overview-v2" className="space-y-4">
          <Card className="p-0 overflow-hidden" style={{ height: '700px' }}>
            <TestDriveProcessV2 />
          </Card>
        </TabsContent>

        {/* Sales Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <SalesFunnel />
          </Card>

          <Card className="p-0 overflow-hidden">
            <ConversionHeatmap />
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <TestDrivesOverTime filters={simpleFilters} />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0 overflow-hidden">
              <TimeToTestDrive />
            </Card>

            <Card className="p-0 overflow-hidden">
              <DurationByModel />
            </Card>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <DemographicsChart filters={simpleFilters} />
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0 overflow-hidden">
              <ChannelPerformance filters={filters} />
            </Card>

            <Card className="p-0 overflow-hidden">
              <Leaderboard
                title="Top Showrooms"
                subtitle="By test drive volume"
                data={showroomLeaderboardData}
                valueLabel="Test Drives"
              />
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0 overflow-hidden">
              <Leaderboard
                title="Top Sales Consultants"
                subtitle="By test drives completed"
                data={consultantLeaderboardData}
                valueLabel="Test Drives"
              />
            </Card>

            <Card className="p-0 overflow-hidden">
              <OccurrenceHeatmap />
            </Card>
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <TestDrivesByModel />
          </Card>

          <Card className="p-0 overflow-hidden">
            <PopularModels />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TestDriveDashboard
