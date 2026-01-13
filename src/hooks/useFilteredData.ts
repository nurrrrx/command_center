import { useMemo } from 'react';
import {
  testDriveRecords,
  filterRecords,
  type GlobalFilters,
  type TestDriveRecord,
  LEAD_SOURCES
} from '../test_drive/data/mockData';

// Re-export types for convenience
export type { GlobalFilters, TestDriveRecord };

// Hook to get filtered records
export function useFilteredRecords(filters: GlobalFilters) {
  return useMemo(() => {
    return filterRecords(testDriveRecords, filters);
  }, [filters]);
}

// Aggregate data for TestDrivesOverTime chart
export function useTimeSeriesData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, number>();

    records.forEach(record => {
      const count = grouped.get(record.date) || 0;
      grouped.set(record.date, count + 1);
    });

    return Array.from(grouped.entries())
      .map(([date, testDrives]) => ({ date, testDrives }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);
}

// Aggregate data for Popular Models chart
export function usePopularModelsData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, { count: number; type: string }>();

    records.forEach(record => {
      const existing = grouped.get(record.model) || { count: 0, type: record.modelType };
      grouped.set(record.model, { count: existing.count + 1, type: record.modelType });
    });

    return Array.from(grouped.entries())
      .map(([model, data]) => ({
        model,
        type: data.type,
        testDrives: data.count
      }))
      .sort((a, b) => b.testDrives - a.testDrives);
  }, [records]);
}

// Aggregate data for Channel Performance chart
export function useChannelPerformanceData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, { leads: number; testDrives: number; conversions: number }>();

    records.forEach(record => {
      const existing = grouped.get(record.channel) || { leads: 0, testDrives: 0, conversions: 0 };
      grouped.set(record.channel, {
        leads: existing.leads + 1,
        testDrives: existing.testDrives + (record.completed ? 1 : 0),
        conversions: existing.conversions + (record.convertedToSale ? 1 : 0)
      });
    });

    return Array.from(grouped.entries())
      .map(([source, data]) => ({
        source,
        leads: data.leads,
        testDrives: data.testDrives,
        conversion: data.leads > 0 ? Math.round((data.testDrives / data.leads) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.leads - a.leads);
  }, [records]);
}

// Aggregate data for Completion Rate
export function useCompletionData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.completed).length;
    const notCompleted = total - completed;

    return {
      total,
      completed,
      notCompleted,
      completionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0
    };
  }, [records]);
}

// Aggregate data for Occurrence (Show/No-Show)
export function useOccurrenceData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const totalBooked = records.length;
    const firstShow = records.filter(r => r.occurrence === 'first_show').length;
    const rescheduled = records.filter(r => r.occurrence === 'rescheduled').length;
    const cancelled = records.filter(r => r.occurrence === 'cancelled').length;
    const noShowActual = records.filter(r => r.occurrence === 'no_show').length;

    return {
      totalBooked,
      show: {
        total: firstShow + rescheduled,
        firstShow,
        rescheduled
      },
      noShow: {
        total: cancelled + noShowActual,
        cancelled,
        noShowActual
      }
    };
  }, [records]);
}

// Aggregate data for Demographics (Age)
export function useAgeDistributionData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const groups = [
      { label: '18-25', min: 18, max: 25 },
      { label: '26-35', min: 26, max: 35 },
      { label: '36-45', min: 36, max: 45 },
      { label: '46-55', min: 46, max: 55 },
      { label: '55+', min: 56, max: 100 }
    ];

    const total = records.length;

    return groups.map(group => {
      const count = records.filter(r => r.customerAge >= group.min && r.customerAge <= group.max).length;
      return {
        ageGroup: group.label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0
      };
    });
  }, [records]);
}

// Aggregate data for Demographics (Gender)
export function useGenderDistributionData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const total = records.length;
    const male = records.filter(r => r.customerGender === 'Male').length;
    const female = records.filter(r => r.customerGender === 'Female').length;

    return [
      { gender: 'Male', count: male, percentage: total > 0 ? Math.round((male / total) * 1000) / 10 : 0 },
      { gender: 'Female', count: female, percentage: total > 0 ? Math.round((female / total) * 1000) / 10 : 0 }
    ];
  }, [records]);
}

// Aggregate data for Showroom Leaderboard
export function useShowroomLeaderboardData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, { testDrives: number; conversions: number }>();

    records.forEach(record => {
      const existing = grouped.get(record.showroom) || { testDrives: 0, conversions: 0 };
      grouped.set(record.showroom, {
        testDrives: existing.testDrives + (record.completed ? 1 : 0),
        conversions: existing.conversions + (record.convertedToSale ? 1 : 0)
      });
    });

    return Array.from(grouped.entries())
      .map(([showroom, data]) => ({
        showroom,
        testDrives: data.testDrives,
        conversions: data.conversions,
        conversionRate: data.testDrives > 0 ? Math.round((data.conversions / data.testDrives) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.testDrives - a.testDrives);
  }, [records]);
}

// Aggregate data for Sales Consultant Leaderboard
export function useSalesConsultantLeaderboardData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, { showroom: string; testDrives: number; conversions: number }>();

    records.forEach(record => {
      const existing = grouped.get(record.salesConsultant) || { showroom: record.showroom, testDrives: 0, conversions: 0 };
      grouped.set(record.salesConsultant, {
        showroom: record.showroom,
        testDrives: existing.testDrives + (record.completed ? 1 : 0),
        conversions: existing.conversions + (record.convertedToSale ? 1 : 0)
      });
    });

    return Array.from(grouped.entries())
      .map(([name, data]) => ({
        name,
        showroom: data.showroom,
        testDrives: data.testDrives,
        conversions: data.conversions,
        conversionRate: data.testDrives > 0 ? Math.round((data.conversions / data.testDrives) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }, [records]);
}

// Aggregate data for Duration by Model
export function useDurationByModelData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, { durations: number[]; type: string }>();

    records.filter(r => r.completed && r.duration > 0).forEach(record => {
      const existing = grouped.get(record.model) || { durations: [], type: record.modelType };
      existing.durations.push(record.duration);
      grouped.set(record.model, existing);
    });

    return Array.from(grouped.entries())
      .map(([model, data]) => {
        const sorted = data.durations.sort((a, b) => a - b);
        const min = sorted[0] || 0;
        const max = sorted[sorted.length - 1] || 0;
        const avg = sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0;

        return {
          model,
          type: data.type,
          minDuration: min,
          maxDuration: max,
          avgDuration: avg,
          values: sorted
        };
      })
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }, [records]);
}

// Aggregate data for Time to Test Drive by Showroom
export function useTimeToTestDriveData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, number[]>();

    records.forEach(record => {
      const existing = grouped.get(record.showroom) || [];
      existing.push(record.timeToTestDrive);
      grouped.set(record.showroom, existing);
    });

    return Array.from(grouped.entries())
      .map(([showroom, times]) => {
        const sorted = times.sort((a, b) => a - b);
        const min = sorted[0] || 0;
        const max = sorted[sorted.length - 1] || 0;
        const avg = sorted.length > 0 ? Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 10) / 10 : 0;

        return {
          showroom,
          minDays: min,
          maxDays: max,
          avgDays: avg,
          values: sorted
        };
      })
      .sort((a, b) => a.avgDays - b.avgDays);
  }, [records]);
}

// Aggregate data for Sales Funnel
export function useSalesFunnelData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    // Group by channel for source breakdown
    const byChannel = new Map<string, {
      requests: number;
      qualified: number;
      booked: number;
      completed: number;
      orders: number;
      invoices: number;
    }>();

    // Initialize all channels
    LEAD_SOURCES.forEach(source => {
      byChannel.set(source, {
        requests: 0,
        qualified: 0,
        booked: 0,
        completed: 0,
        orders: 0,
        invoices: 0
      });
    });

    records.forEach(record => {
      const channelData = byChannel.get(record.channel);
      if (!channelData) return;

      channelData.requests++;

      if (record.funnelStage !== 'request') {
        channelData.qualified++;
      }
      if (['booked', 'completed', 'order', 'invoice'].includes(record.funnelStage)) {
        channelData.booked++;
      }
      if (['completed', 'order', 'invoice'].includes(record.funnelStage)) {
        channelData.completed++;
      }
      if (['order', 'invoice'].includes(record.funnelStage)) {
        channelData.orders++;
      }
      if (record.funnelStage === 'invoice') {
        channelData.invoices++;
      }
    });

    const salesFunnelBySource = Array.from(byChannel.entries()).map(([source, data]) => ({
      source,
      ...data,
      fAndI: Math.round(data.invoices * 0.7),
      cash: Math.round(data.invoices * 0.3)
    }));

    // Calculate totals
    const totals = salesFunnelBySource.reduce((acc, s) => ({
      requests: acc.requests + s.requests,
      qualified: acc.qualified + s.qualified,
      booked: acc.booked + s.booked,
      completed: acc.completed + s.completed,
      orders: acc.orders + s.orders,
      invoices: acc.invoices + s.invoices,
      fAndI: acc.fAndI + s.fAndI,
      cash: acc.cash + s.cash
    }), { requests: 0, qualified: 0, booked: 0, completed: 0, orders: 0, invoices: 0, fAndI: 0, cash: 0 });

    return {
      bySource: salesFunnelBySource,
      stages: [
        { name: 'Requests', value: totals.requests, description: 'Total test drive requests' },
        { name: 'Call Center Qualified', value: totals.qualified, description: 'Leads qualified by call center' },
        { name: 'Sales Exec Booked', value: totals.booked, description: 'Appointments booked' },
        { name: 'Completed', value: totals.completed, description: 'Test drives completed' },
        { name: 'Orders', value: totals.orders, description: 'Orders placed' },
        { name: 'Invoices', value: totals.invoices, description: 'Invoiced orders' }
      ],
      invoiceBreakdown: {
        fAndI: { label: 'F&I', value: totals.fAndI, percentage: totals.invoices > 0 ? Math.round((totals.fAndI / totals.invoices) * 100) : 70 },
        cash: { label: 'Cash', value: totals.cash, percentage: totals.invoices > 0 ? Math.round((totals.cash / totals.invoices) * 100) : 30 }
      }
    };
  }, [records]);
}

// Aggregate data for Showroom Map
export function useShowroomMapData(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const grouped = new Map<string, number>();

    records.filter(r => r.completed).forEach(record => {
      const count = grouped.get(record.showroom) || 0;
      grouped.set(record.showroom, count + 1);
    });

    return Array.from(grouped.entries())
      .map(([showroom, count]) => ({ showroom, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);
}

// Get summary stats
export function useSummaryStats(filters: GlobalFilters) {
  const records = useFilteredRecords(filters);

  return useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.completed).length;
    const conversions = records.filter(r => r.convertedToSale).length;

    return {
      totalTestDrives: total,
      completedTestDrives: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
      conversions,
      conversionRate: completed > 0 ? Math.round((conversions / completed) * 1000) / 10 : 0
    };
  }, [records]);
}
