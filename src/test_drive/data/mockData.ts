// Mock data for Lexus UAE Test Drive Command Center

// Lexus models available in UAE - organized by type
export const LEXUS_MODEL_TYPES = {
  SUV: ['UX300h', 'NX350', 'NX350h', 'RX350', 'RX350h', 'RX500h', 'LX600', 'LX700h'],
  Sedan: ['IS300', 'ES350', 'ES300h', 'LS350', 'LS500h'],
  Performance: ['RC350', 'RC F', 'LC500', 'LC500 Convertible']
} as const;

// Flat array of all models for backwards compatibility
export const LEXUS_MODELS = [
  ...LEXUS_MODEL_TYPES.SUV,
  ...LEXUS_MODEL_TYPES.Sedan,
  ...LEXUS_MODEL_TYPES.Performance
];

// UAE Lexus Showrooms with full details
export interface ShowroomInfo {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const UAE_SHOWROOMS_DATA: ShowroomInfo[] = [
  { id: 'dfc', name: 'Lexus Showroom DFC', shortName: 'DFC', city: 'Dubai', country: 'UAE', latitude: 25.2209, longitude: 55.4103 },
  { id: 'szr', name: 'Lexus Showroom Sheikh Zayed Road', shortName: 'Sheikh Zayed Road', city: 'Dubai', country: 'UAE', latitude: 25.1397, longitude: 55.2126 },
  { id: 'dip', name: 'Lexus Showroom Dubai Investment Park (DIP)', shortName: 'DIP', city: 'Dubai', country: 'UAE', latitude: 24.9938, longitude: 55.1814 },
  { id: 'auh', name: 'Lexus Showroom Abu Dhabi', shortName: 'Abu Dhabi', city: 'Abu Dhabi', country: 'UAE', latitude: 24.4490, longitude: 54.3880 },
  { id: 'shj', name: 'Lexus Showroom Sharjah', shortName: 'Sharjah', city: 'Sharjah', country: 'UAE', latitude: 25.3385, longitude: 55.4120 },
  { id: 'khf', name: 'Lexus Showroom Khorfakkan', shortName: 'Khorfakkan', city: 'Sharjah', country: 'UAE', latitude: 25.3379, longitude: 56.3565 },
  { id: 'rak', name: 'Lexus Showroom RAK', shortName: 'Ras Al Khaimah', city: 'Ras Al Khaimah', country: 'UAE', latitude: 25.7664, longitude: 55.9434 },
  { id: 'ajm', name: 'Lexus Showroom Ajman', shortName: 'Ajman', city: 'Ajman', country: 'UAE', latitude: 25.3974, longitude: 55.4608 },
  { id: 'fuj', name: 'Lexus Showroom Fujairah', shortName: 'Fujairah', city: 'Fujairah', country: 'UAE', latitude: 25.1310, longitude: 56.3269 },
  { id: 'uaq', name: 'Lexus Showroom Umm Al Quwain', shortName: 'Umm Al Quwain', city: 'Umm Al Quwain', country: 'UAE', latitude: 25.5667, longitude: 55.5533 },
  { id: 'ain', name: 'Lexus Showroom Al Ain (Al-Futtaim Auto Park)', shortName: 'Al Ain', city: 'Al Ain', country: 'UAE', latitude: 24.2075, longitude: 55.7440 }
];

// Simple array of showroom names for backwards compatibility
export const UAE_SHOWROOMS = UAE_SHOWROOMS_DATA.map(s => s.name);

// Chart 1: Test Drive Funnel - Lead Sources
export const leadSourcesData = [
  { source: 'Instagram', leads: 2450, testDrives: 892, conversion: 36.4 },
  { source: 'Facebook', leads: 1890, testDrives: 624, conversion: 33.0 },
  { source: 'TikTok', leads: 1120, testDrives: 291, conversion: 26.0 },
  { source: 'Website Organic', leads: 3200, testDrives: 1344, conversion: 42.0 },
  { source: 'Website Paid', leads: 2800, testDrives: 1092, conversion: 39.0 },
  { source: 'Google Search', leads: 1650, testDrives: 693, conversion: 42.0 },
  { source: 'Call Center', leads: 980, testDrives: 519, conversion: 53.0 },
  { source: 'CRM', leads: 1450, testDrives: 725, conversion: 50.0 },
  { source: 'WhatsApp', leads: 760, testDrives: 334, conversion: 44.0 }
];

// Chart 2: Test Drive Completion
export const completionData = {
  total: 6514,
  completed: 5211,
  notCompleted: 1303,
  completionRate: 80.0
};

// Chart 3: Popular Models
export const popularModelsData = [
  // SUVs
  { model: 'RX350', type: 'SUV', testDrives: 1245 },
  { model: 'LX600', type: 'SUV', testDrives: 1089 },
  { model: 'NX350', type: 'SUV', testDrives: 892 },
  { model: 'RX500h', type: 'SUV', testDrives: 634 },
  { model: 'NX350h', type: 'SUV', testDrives: 521 },
  { model: 'UX300h', type: 'SUV', testDrives: 356 },
  { model: 'LX700h', type: 'SUV', testDrives: 312 },
  { model: 'RX350h', type: 'SUV', testDrives: 289 },
  // Sedans
  { model: 'ES350', type: 'Sedan', testDrives: 756 },
  { model: 'IS300', type: 'Sedan', testDrives: 412 },
  { model: 'ES300h', type: 'Sedan', testDrives: 234 },
  { model: 'LS500h', type: 'Sedan', testDrives: 189 },
  { model: 'LS350', type: 'Sedan', testDrives: 145 },
  // Performance
  { model: 'LC500', type: 'Performance', testDrives: 112 },
  { model: 'RC350', type: 'Performance', testDrives: 98 },
  { model: 'RC F', type: 'Performance', testDrives: 74 },
  { model: 'LC500 Convertible', type: 'Performance', testDrives: 56 }
];

// Chart 3b: Popular Models with Funnel Data (Leads → Qualified → Booked → Performed)
// Note: Different drop-off patterns per model to show varied conversion behaviors
export const popularModelsWithFunnelData = [
  // SUVs - varied conversion patterns
  { model: 'RX350', type: 'SUV', testDrives: 1245, leads: 1560, qualified: 1450, booked: 1350, performed: 1245 }, // High conversion - strong performer
  { model: 'LX600', type: 'SUV', testDrives: 1089, leads: 1680, qualified: 1380, booked: 1220, performed: 1089 }, // Good volume but wider funnel
  { model: 'NX350', type: 'SUV', testDrives: 892, leads: 1420, qualified: 1150, booked: 980, performed: 892 }, // Moderate drop-off
  { model: 'RX500h', type: 'SUV', testDrives: 634, leads: 1050, qualified: 820, booked: 710, performed: 634 }, // Significant qualification drop
  { model: 'NX350h', type: 'SUV', testDrives: 521, leads: 890, qualified: 680, booked: 590, performed: 521 }, // Gradual decline
  { model: 'UX300h', type: 'SUV', testDrives: 356, leads: 720, qualified: 510, booked: 420, performed: 356 }, // Large early drop-off
  { model: 'LX700h', type: 'SUV', testDrives: 312, leads: 420, qualified: 385, booked: 345, performed: 312 }, // Tight funnel - good conversion
  { model: 'RX350h', type: 'SUV', testDrives: 289, leads: 580, qualified: 410, booked: 340, performed: 289 }, // Wide top, narrow bottom
  // Sedans - different patterns
  { model: 'ES350', type: 'Sedan', testDrives: 756, leads: 980, qualified: 890, booked: 820, performed: 756 }, // Strong performer
  { model: 'IS300', type: 'Sedan', testDrives: 412, leads: 850, qualified: 620, booked: 490, performed: 412 }, // Large qualification drop
  { model: 'ES300h', type: 'Sedan', testDrives: 234, leads: 520, qualified: 380, booked: 290, performed: 234 }, // Significant drop at each stage
  { model: 'LS500h', type: 'Sedan', testDrives: 189, leads: 260, qualified: 235, booked: 210, performed: 189 }, // Tight funnel - luxury buyers committed
  { model: 'LS350', type: 'Sedan', testDrives: 145, leads: 340, qualified: 240, booked: 185, performed: 145 }, // Very wide funnel
  // Performance - premium segment patterns
  { model: 'LC500', type: 'Performance', testDrives: 112, leads: 180, qualified: 155, booked: 130, performed: 112 }, // Moderate conversion
  { model: 'RC350', type: 'Performance', testDrives: 98, leads: 210, qualified: 150, booked: 118, performed: 98 }, // Wide funnel - impulse inquiries
  { model: 'RC F', type: 'Performance', testDrives: 74, leads: 95, qualified: 88, booked: 80, performed: 74 }, // Very tight - serious buyers only
  { model: 'LC500 Convertible', type: 'Performance', testDrives: 56, leads: 120, qualified: 85, booked: 68, performed: 56 } // Seasonal/impulse pattern
];

// Chart 4: Test Drive Conversion by Model (Heatmap)
export const conversionByModelData = [
  // SUVs
  { model: 'RX350', type: 'SUV', leads: 1560, qualified: 1245, completed: 1089 },
  { model: 'LX600', type: 'SUV', leads: 1320, qualified: 1089, completed: 923 },
  { model: 'NX350', type: 'SUV', leads: 1120, qualified: 892, completed: 756 },
  { model: 'RX500h', type: 'SUV', leads: 780, qualified: 634, completed: 521 },
  { model: 'NX350h', type: 'SUV', leads: 650, qualified: 521, completed: 443 },
  { model: 'UX300h', type: 'SUV', leads: 450, qualified: 356, completed: 302 },
  { model: 'LX700h', type: 'SUV', leads: 390, qualified: 312, completed: 265 },
  { model: 'RX350h', type: 'SUV', leads: 360, qualified: 289, completed: 246 },
  // Sedans
  { model: 'ES350', type: 'Sedan', leads: 920, qualified: 756, completed: 642 },
  { model: 'IS300', type: 'Sedan', leads: 520, qualified: 412, completed: 356 },
  { model: 'ES300h', type: 'Sedan', leads: 310, qualified: 234, completed: 199 },
  { model: 'LS500h', type: 'Sedan', leads: 250, qualified: 189, completed: 161 },
  { model: 'LS350', type: 'Sedan', leads: 180, qualified: 145, completed: 123 },
  // Performance
  { model: 'LC500', type: 'Performance', leads: 150, qualified: 112, completed: 95 },
  { model: 'RC350', type: 'Performance', leads: 125, qualified: 98, completed: 83 },
  { model: 'RC F', type: 'Performance', leads: 100, qualified: 74, completed: 63 },
  { model: 'LC500 Convertible', type: 'Performance', leads: 75, qualified: 56, completed: 48 }
];

// Chart 5: Test Drives Needed to Complete an Order
export const testDrivesNeededData = [
  { category: '1 Test Drive', percentage: 68, count: 3542 },
  { category: '2 Test Drives', percentage: 22, count: 1145 },
  { category: '3+ Test Drives', percentage: 10, count: 524 }
];

// Chart 6 & 7: Time series data generator
export function generateTimeSeriesData(startDate: Date, endDate: Date, models?: string[]) {
  const data: Array<{ date: string; model?: string; testDrives: number }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (models) {
      models.forEach(model => {
        // Base value varies by model popularity
        const modelIndex = LEXUS_MODELS.indexOf(model);
        const baseValue = Math.max(5, 30 - modelIndex * 2);

        // Add seasonality and randomness
        const dayOfWeek = currentDate.getDay();
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
        const monthMultiplier = 1 + Math.sin((currentDate.getMonth() / 12) * Math.PI * 2) * 0.2;
        const randomFactor = 0.7 + Math.random() * 0.6;

        data.push({
          date: currentDate.toISOString().split('T')[0],
          model,
          testDrives: Math.round(baseValue * weekendMultiplier * monthMultiplier * randomFactor)
        });
      });
    } else {
      // Aggregate data
      const dayOfWeek = currentDate.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0;
      const monthMultiplier = 1 + Math.sin((currentDate.getMonth() / 12) * Math.PI * 2) * 0.25;
      const yearGrowth = 1 + (currentDate.getFullYear() - 2022) * 0.15;
      const randomFactor = 0.75 + Math.random() * 0.5;
      const baseValue = 18;

      data.push({
        date: currentDate.toISOString().split('T')[0],
        testDrives: Math.round(baseValue * weekendMultiplier * monthMultiplier * yearGrowth * randomFactor)
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

// Pre-generated time series for performance
const threeYearsAgo = new Date();
threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
export const timeSeriesData = generateTimeSeriesData(threeYearsAgo, new Date());
export const timeSeriesByModelData = generateTimeSeriesData(
  threeYearsAgo,
  new Date(),
  ['RX350', 'LX600', 'NX350', 'ES350', 'RX500h']
);

// Chart 8: Distribution by Age
export const ageDistributionData = [
  { ageGroup: '18-25', count: 456, percentage: 7.0 },
  { ageGroup: '26-35', count: 2280, percentage: 35.0 },
  { ageGroup: '36-45', count: 2086, percentage: 32.0 },
  { ageGroup: '46-55', count: 1172, percentage: 18.0 },
  { ageGroup: '55+', count: 520, percentage: 8.0 }
];

// Chart 9: Distribution by Gender
export const genderDistributionData = [
  { gender: 'Male', count: 4560, percentage: 70.0 },
  { gender: 'Female', count: 1954, percentage: 30.0 }
];

// Gender distribution by age group (for linked charts)
export const genderByAgeData: Record<string, { gender: string; count: number; percentage: number }[]> = {
  '18-25': [
    { gender: 'Male', count: 319, percentage: 70.0 },
    { gender: 'Female', count: 137, percentage: 30.0 }
  ],
  '26-35': [
    { gender: 'Male', count: 1596, percentage: 70.0 },
    { gender: 'Female', count: 684, percentage: 30.0 }
  ],
  '36-45': [
    { gender: 'Male', count: 1460, percentage: 70.0 },
    { gender: 'Female', count: 626, percentage: 30.0 }
  ],
  '46-55': [
    { gender: 'Male', count: 820, percentage: 70.0 },
    { gender: 'Female', count: 352, percentage: 30.0 }
  ],
  '55+': [
    { gender: 'Male', count: 364, percentage: 70.0 },
    { gender: 'Female', count: 156, percentage: 30.0 }
  ]
};

// Age distribution by gender (for linked charts - when clicking on gender pie)
export const ageByGenderData: Record<string, { ageGroup: string; count: number; percentage: number }[]> = {
  'Male': [
    { ageGroup: '18-25', count: 319, percentage: 7.0 },
    { ageGroup: '26-35', count: 1596, percentage: 35.0 },
    { ageGroup: '36-45', count: 1460, percentage: 32.0 },
    { ageGroup: '46-55', count: 820, percentage: 18.0 },
    { ageGroup: '55+', count: 365, percentage: 8.0 }
  ],
  'Female': [
    { ageGroup: '18-25', count: 137, percentage: 7.0 },
    { ageGroup: '26-35', count: 684, percentage: 35.0 },
    { ageGroup: '36-45', count: 626, percentage: 32.0 },
    { ageGroup: '46-55', count: 352, percentage: 18.0 },
    { ageGroup: '55+', count: 155, percentage: 8.0 }
  ]
};

// Chart 10: Time to Test Drive by Showroom
export const timeToTestDriveData = [
  { showroom: 'DFC', minDays: 1, maxDays: 5, avgDays: 2.3 },
  { showroom: 'Sheikh Zayed Road', minDays: 1, maxDays: 4, avgDays: 2.1 },
  { showroom: 'DIP', minDays: 1, maxDays: 5, avgDays: 2.5 },
  { showroom: 'Abu Dhabi', minDays: 2, maxDays: 6, avgDays: 3.2 },
  { showroom: 'Sharjah', minDays: 1, maxDays: 5, avgDays: 2.8 },
  { showroom: 'Khorfakkan', minDays: 2, maxDays: 7, avgDays: 4.0 },
  { showroom: 'Ras Al Khaimah', minDays: 3, maxDays: 8, avgDays: 4.5 },
  { showroom: 'Ajman', minDays: 2, maxDays: 6, avgDays: 3.4 },
  { showroom: 'Fujairah', minDays: 2, maxDays: 7, avgDays: 4.2 },
  { showroom: 'Umm Al Quwain', minDays: 2, maxDays: 7, avgDays: 4.0 },
  { showroom: 'Al Ain', minDays: 2, maxDays: 7, avgDays: 3.8 }
];

// Chart 11: Test Drive Duration by Model
export const durationByModelData = [
  // SUVs
  { model: 'UX300h', type: 'SUV', minDuration: 15, maxDuration: 35, avgDuration: 24 },
  { model: 'NX350', type: 'SUV', minDuration: 20, maxDuration: 40, avgDuration: 28 },
  { model: 'NX350h', type: 'SUV', minDuration: 20, maxDuration: 42, avgDuration: 30 },
  { model: 'RX350', type: 'SUV', minDuration: 20, maxDuration: 45, avgDuration: 32 },
  { model: 'RX350h', type: 'SUV', minDuration: 22, maxDuration: 48, avgDuration: 34 },
  { model: 'RX500h', type: 'SUV', minDuration: 25, maxDuration: 50, avgDuration: 35 },
  { model: 'LX600', type: 'SUV', minDuration: 30, maxDuration: 60, avgDuration: 45 },
  { model: 'LX700h', type: 'SUV', minDuration: 32, maxDuration: 62, avgDuration: 47 },
  // Sedans
  { model: 'IS300', type: 'Sedan', minDuration: 20, maxDuration: 45, avgDuration: 30 },
  { model: 'ES350', type: 'Sedan', minDuration: 20, maxDuration: 40, avgDuration: 28 },
  { model: 'ES300h', type: 'Sedan', minDuration: 20, maxDuration: 42, avgDuration: 29 },
  { model: 'LS350', type: 'Sedan', minDuration: 28, maxDuration: 52, avgDuration: 40 },
  { model: 'LS500h', type: 'Sedan', minDuration: 30, maxDuration: 55, avgDuration: 42 },
  // Performance
  { model: 'RC350', type: 'Performance', minDuration: 25, maxDuration: 50, avgDuration: 36 },
  { model: 'RC F', type: 'Performance', minDuration: 30, maxDuration: 55, avgDuration: 42 },
  { model: 'LC500', type: 'Performance', minDuration: 35, maxDuration: 60, avgDuration: 48 },
  { model: 'LC500 Convertible', type: 'Performance', minDuration: 38, maxDuration: 65, avgDuration: 52 }
];

// Chart 12: Call Center Agent Leaderboard
export const callCenterAgentsData = [
  { name: 'Ahmed Al Mansoori', leads: 245, conversions: 142, conversionRate: 58.0 },
  { name: 'Fatima Hassan', leads: 312, conversions: 172, conversionRate: 55.1 },
  { name: 'Mohammed Al Zaabi', leads: 198, conversions: 105, conversionRate: 53.0 },
  { name: 'Sara Al Ketbi', leads: 267, conversions: 139, conversionRate: 52.1 },
  { name: 'Omar Khalid', leads: 223, conversions: 112, conversionRate: 50.2 },
  { name: 'Layla Al Shamsi', leads: 189, conversions: 91, conversionRate: 48.1 },
  { name: 'Khalid Ibrahim', leads: 234, conversions: 108, conversionRate: 46.2 },
  { name: 'Noura Al Hammadi', leads: 176, conversions: 79, conversionRate: 44.9 },
  { name: 'Youssef Al Nuaimi', leads: 201, conversions: 86, conversionRate: 42.8 },
  { name: 'Mariam Al Suwaidi', leads: 156, conversions: 64, conversionRate: 41.0 }
];

// Chart 13: Showrooms Leaderboard
export const showroomsData = [
  { showroom: 'Dubai - DFC', testDrives: 1892, conversions: 1135, conversionRate: 60.0 },
  { showroom: 'Dubai - Sheikh Zayed Road', testDrives: 1654, conversions: 942, conversionRate: 56.9 },
  { showroom: 'Dubai - DIP', testDrives: 1245, conversions: 698, conversionRate: 56.1 },
  { showroom: 'Abu Dhabi', testDrives: 1423, conversions: 769, conversionRate: 54.0 },
  { showroom: 'Sharjah', testDrives: 856, conversions: 445, conversionRate: 52.0 },
  { showroom: 'Khorfakkan', testDrives: 234, conversions: 112, conversionRate: 47.9 },
  { showroom: 'Ras Al Khaimah', testDrives: 311, conversions: 140, conversionRate: 45.0 },
  { showroom: 'Ajman', testDrives: 423, conversions: 198, conversionRate: 46.8 },
  { showroom: 'Fujairah', testDrives: 198, conversions: 87, conversionRate: 43.9 },
  { showroom: 'Umm Al Quwain', testDrives: 156, conversions: 67, conversionRate: 42.9 },
  { showroom: 'Al Ain', testDrives: 478, conversions: 234, conversionRate: 49.0 }
];

// Chart 14: Test Drives by Occurrence (Radial)
export const occurrenceData = {
  totalBooked: 6514,
  show: {
    total: 5211,
    firstShow: 4168,
    rescheduled: 1043
  },
  noShow: {
    total: 1303,
    cancelled: 782,
    noShowActual: 521
  }
};

// Chart 15: Occurrence by Model Heatmap
export const occurrenceByModelData = LEXUS_MODELS.map(model => {
  const baseBookings = Math.floor(Math.random() * 400) + 100;
  const showRate = 0.75 + Math.random() * 0.15;
  const firstShowRate = 0.75 + Math.random() * 0.1;
  const cancelRate = 0.55 + Math.random() * 0.15;

  const show = Math.round(baseBookings * showRate);
  const noShow = baseBookings - show;

  return {
    model,
    booked: baseBookings,
    firstShow: Math.round(show * firstShowRate),
    rescheduled: Math.round(show * (1 - firstShowRate)),
    cancelled: Math.round(noShow * cancelRate),
    noShow: Math.round(noShow * (1 - cancelRate))
  };
});

// Chart 16: Sales Executive Leaderboard
export const salesExecutivesData = [
  // DFC (Blue)
  { name: 'Ahmad Rashid', showroom: 'DFC', testDrives: 145, conversions: 98, conversionRate: 67.6, color: '#4285f4' },
  { name: 'Nadia Al Hashemi', showroom: 'DFC', testDrives: 132, conversions: 86, conversionRate: 65.2, color: '#4285f4' },
  { name: 'Hassan Omar', showroom: 'DFC', testDrives: 118, conversions: 74, conversionRate: 62.7, color: '#4285f4' },
  // Sheikh Zayed Road (Green)
  { name: 'Salim Al Kaabi', showroom: 'Sheikh Zayed Road', testDrives: 156, conversions: 97, conversionRate: 62.2, color: '#34a853' },
  { name: 'Reem Al Mazrouei', showroom: 'Sheikh Zayed Road', testDrives: 128, conversions: 78, conversionRate: 60.9, color: '#34a853' },
  { name: 'Faisal Mahmoud', showroom: 'Sheikh Zayed Road', testDrives: 112, conversions: 65, conversionRate: 58.0, color: '#34a853' },
  // DIP (Light Blue)
  { name: 'Tariq Al Mulla', showroom: 'DIP', testDrives: 134, conversions: 82, conversionRate: 61.2, color: '#03a9f4' },
  { name: 'Noora Al Shamsi', showroom: 'DIP', testDrives: 121, conversions: 71, conversionRate: 58.7, color: '#03a9f4' },
  // Abu Dhabi (Orange)
  { name: 'Maryam Al Dhaheri', showroom: 'Abu Dhabi', testDrives: 134, conversions: 75, conversionRate: 56.0, color: '#fbbc04' },
  { name: 'Khalid Al Remeithi', showroom: 'Abu Dhabi', testDrives: 121, conversions: 66, conversionRate: 54.5, color: '#fbbc04' },
  { name: 'Aisha Saeed', showroom: 'Abu Dhabi', testDrives: 98, conversions: 52, conversionRate: 53.1, color: '#fbbc04' },
  // Sharjah (Red)
  { name: 'Younis Al Hosani', showroom: 'Sharjah', testDrives: 89, conversions: 46, conversionRate: 51.7, color: '#ea4335' },
  { name: 'Latifa Al Qassimi', showroom: 'Sharjah', testDrives: 76, conversions: 38, conversionRate: 50.0, color: '#ea4335' },
  // Khorfakkan (Pink)
  { name: 'Saif Al Ketbi', showroom: 'Khorfakkan', testDrives: 45, conversions: 22, conversionRate: 48.9, color: '#e91e63' },
  // Ras Al Khaimah (Teal)
  { name: 'Rashid Al Sharhan', showroom: 'Ras Al Khaimah', testDrives: 52, conversions: 24, conversionRate: 46.2, color: '#00bcd4' },
  { name: 'Amna Al Tunaiji', showroom: 'Ras Al Khaimah', testDrives: 45, conversions: 20, conversionRate: 44.4, color: '#00bcd4' },
  // Ajman (Indigo)
  { name: 'Mohammed Al Suwaidi', showroom: 'Ajman', testDrives: 67, conversions: 32, conversionRate: 47.8, color: '#3f51b5' },
  { name: 'Fatima Al Zaabi', showroom: 'Ajman', testDrives: 58, conversions: 27, conversionRate: 46.6, color: '#3f51b5' },
  // Fujairah (Deep Orange)
  { name: 'Omar Al Nuaimi', showroom: 'Fujairah', testDrives: 42, conversions: 18, conversionRate: 42.9, color: '#ff5722' },
  // Umm Al Quwain (Brown)
  { name: 'Sara Al Hammadi', showroom: 'Umm Al Quwain', testDrives: 38, conversions: 16, conversionRate: 42.1, color: '#795548' },
  // Al Ain (Purple)
  { name: 'Ibrahim Al Nuaimi', showroom: 'Al Ain', testDrives: 67, conversions: 32, conversionRate: 47.8, color: '#9334e6' },
  { name: 'Huda Al Darmaki', showroom: 'Al Ain', testDrives: 54, conversions: 25, conversionRate: 46.3, color: '#9334e6' }
];

// Showroom color mapping
export const SHOWROOM_COLORS: Record<string, string> = {
  'DFC': '#4285f4',
  'Sheikh Zayed Road': '#34a853',
  'DIP': '#03a9f4',
  'Abu Dhabi': '#fbbc04',
  'Sharjah': '#ea4335',
  'Khorfakkan': '#e91e63',
  'Ras Al Khaimah': '#00bcd4',
  'Ajman': '#3f51b5',
  'Fujairah': '#ff5722',
  'Umm Al Quwain': '#795548',
  'Al Ain': '#9334e6'
};

// Lead sources with conversion rates for Sales Funnel
export const LEAD_SOURCES = [
  'Instagram', 'Facebook', 'TikTok', 'Website Organic', 'Website Paid',
  'Google Search', 'Call Center', 'CRM', 'WhatsApp'
];

// Lead source colors - Priority palette
export const LEAD_SOURCE_COLORS: Record<string, string> = {
  'Instagram': '#051C2A',      // 1st priority
  'Facebook': '#163E93',       // 2nd priority
  'TikTok': '#30A3DA',         // 3rd priority
  'Website Organic': '#060200', // 4th priority
  'Website Paid': '#025645',   // 5th priority
  'Google Search': '#337B68',  // 6th priority
  'Call Center': '#E6B437',    // 7th priority
  'CRM': '#BF0404',            // 8th priority
  'WhatsApp': '#979797'        // 9th priority
};

// Funnel data by source with full journey metrics
export const salesFunnelBySource = [
  {
    source: 'Instagram',
    requests: 2450,
    qualified: 1837,
    booked: 1225,
    completed: 980,
    orders: 294,
    invoices: 245,
    fAndI: 172,
    cash: 73
  },
  {
    source: 'Facebook',
    requests: 1890,
    qualified: 1418,
    booked: 945,
    completed: 756,
    orders: 227,
    invoices: 189,
    fAndI: 132,
    cash: 57
  },
  {
    source: 'TikTok',
    requests: 1120,
    qualified: 784,
    booked: 523,
    completed: 418,
    orders: 109,
    invoices: 91,
    fAndI: 64,
    cash: 27
  },
  {
    source: 'Website Organic',
    requests: 3200,
    qualified: 2560,
    booked: 1706,
    completed: 1365,
    orders: 437,
    invoices: 364,
    fAndI: 255,
    cash: 109
  },
  {
    source: 'Website Paid',
    requests: 2800,
    qualified: 2100,
    booked: 1400,
    completed: 1120,
    orders: 347,
    invoices: 289,
    fAndI: 202,
    cash: 87
  },
  {
    source: 'Google Search',
    requests: 1650,
    qualified: 1320,
    booked: 880,
    completed: 704,
    orders: 218,
    invoices: 182,
    fAndI: 127,
    cash: 55
  },
  {
    source: 'Call Center',
    requests: 980,
    qualified: 833,
    booked: 588,
    completed: 470,
    orders: 160,
    invoices: 133,
    fAndI: 93,
    cash: 40
  },
  {
    source: 'CRM',
    requests: 1450,
    qualified: 1160,
    booked: 812,
    completed: 650,
    orders: 130,
    invoices: 108,
    fAndI: 76,
    cash: 32
  },
  {
    source: 'WhatsApp',
    requests: 760,
    qualified: 608,
    booked: 405,
    completed: 324,
    orders: 81,
    invoices: 67,
    fAndI: 47,
    cash: 20
  }
];

// Calculate totals for aggregate funnel view
export const salesFunnelData = {
  stages: [
    { name: 'Requests', value: salesFunnelBySource.reduce((sum, s) => sum + s.requests, 0), description: 'Total test drive requests from all channels' },
    { name: 'Call Center Qualified', value: salesFunnelBySource.reduce((sum, s) => sum + s.qualified, 0), description: 'Leads qualified by call center' },
    { name: 'Sales Exec Booked', value: salesFunnelBySource.reduce((sum, s) => sum + s.booked, 0), description: 'Appointments booked by sales executives' },
    { name: 'Completed', value: salesFunnelBySource.reduce((sum, s) => sum + s.completed, 0), description: 'Test drives completed' },
    { name: 'Orders', value: salesFunnelBySource.reduce((sum, s) => sum + s.orders, 0), description: 'Orders placed after test drive' },
    { name: 'Invoices', value: salesFunnelBySource.reduce((sum, s) => sum + s.invoices, 0), description: 'Invoiced orders' },
  ],
  invoiceBreakdown: {
    fAndI: { label: 'F&I', value: salesFunnelBySource.reduce((sum, s) => sum + s.fAndI, 0), percentage: 70.0 },
    cash: { label: 'Cash', value: salesFunnelBySource.reduce((sum, s) => sum + s.cash, 0), percentage: 30.0 }
  },
  ordersInProgress: 326
};

// Generate distribution data for violin/boxplot charts
// Uses a normal distribution centered on avgDays with appropriate spread
function generateDistribution(min: number, max: number, avg: number, count: number = 50): number[] {
  const values: number[] = [];
  const stdDev = (max - min) / 4; // Approximate standard deviation

  for (let i = 0; i < count; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    let value = avg + z * stdDev;
    // Clamp to min/max range
    value = Math.max(min, Math.min(max, value));
    values.push(Math.round(value * 10) / 10);
  }
  return values.sort((a, b) => a - b);
}

// Chart 10b: Time to Test Drive Distribution Data (for violin/boxplot)
export const timeToTestDriveDistribution = timeToTestDriveData.map(d => ({
  showroom: d.showroom,
  values: generateDistribution(d.minDays, d.maxDays, d.avgDays, 50),
  // Pre-calculated statistics for boxplot
  min: d.minDays,
  max: d.maxDays,
  avg: d.avgDays,
  q1: d.avgDays - (d.avgDays - d.minDays) * 0.5,
  median: d.avgDays,
  q3: d.avgDays + (d.maxDays - d.avgDays) * 0.5
}));

// Chart 11b: Duration by Model Distribution Data (for violin/boxplot)
export const durationByModelDistribution = durationByModelData.map(d => ({
  model: d.model,
  values: generateDistribution(d.minDuration, d.maxDuration, d.avgDuration, 50),
  // Pre-calculated statistics for boxplot
  min: d.minDuration,
  max: d.maxDuration,
  avg: d.avgDuration,
  q1: d.avgDuration - (d.avgDuration - d.minDuration) * 0.5,
  median: d.avgDuration,
  q3: d.avgDuration + (d.maxDuration - d.avgDuration) * 0.5
}));

// Extended demographic data with age-gender breakdown
export const demographicsByAgeGender = [
  { ageGroup: '18-25', male: 319, female: 137, total: 456 },
  { ageGroup: '26-35', male: 1596, female: 684, total: 2280 },
  { ageGroup: '36-45', male: 1460, female: 626, total: 2086 },
  { ageGroup: '46-55', male: 820, female: 352, total: 1172 },
  { ageGroup: '55+', male: 365, female: 155, total: 520 }
];

// Customer Preferences Data - Top Models
export const modelPreferencesData = [
  { model: 'RX350', type: 'SUV', count: 1245 },
  { model: 'LX600', type: 'SUV', count: 1089 },
  { model: 'NX350', type: 'SUV', count: 892 },
  { model: 'ES350', type: 'Sedan', count: 756 },
  { model: 'RX500h', type: 'SUV', count: 634 },
  { model: 'NX350h', type: 'SUV', count: 521 },
  { model: 'IS300', type: 'Sedan', count: 412 },
  { model: 'UX300h', type: 'SUV', count: 356 },
  { model: 'LX700h', type: 'SUV', count: 312 },
  { model: 'RX350h', type: 'SUV', count: 289 }
];

// Customer Preferences Data - Top Channels
export const channelPreferencesData = [
  { channel: 'Website Organic', count: 3200 },
  { channel: 'Website Paid', count: 2800 },
  { channel: 'Instagram', count: 2450 },
  { channel: 'Facebook', count: 1890 },
  { channel: 'Google Search', count: 1650 },
  { channel: 'CRM', count: 1450 },
  { channel: 'TikTok', count: 1120 },
  { channel: 'Call Center', count: 980 },
  { channel: 'WhatsApp', count: 760 }
];

// Customer Preferences Data - Top Showrooms
export const showroomPreferencesData = [
  { showroom: 'DFC', count: 1892 },
  { showroom: 'Sheikh Zayed Road', count: 1654 },
  { showroom: 'Abu Dhabi', count: 1423 },
  { showroom: 'DIP', count: 1245 },
  { showroom: 'Sharjah', count: 856 },
  { showroom: 'Al Ain', count: 478 },
  { showroom: 'Ajman', count: 423 },
  { showroom: 'Ras Al Khaimah', count: 311 },
  { showroom: 'Khorfakkan', count: 234 },
  { showroom: 'Fujairah', count: 198 },
  { showroom: 'Umm Al Quwain', count: 156 }
];

// =============================================================================
// BASE TEST DRIVE RECORDS DATASET
// This is the granular dataset that can be filtered and aggregated for all charts
// =============================================================================

export interface TestDriveRecord {
  id: string;
  date: string;                      // YYYY-MM-DD
  model: string;                     // e.g., "RX350"
  modelType: 'SUV' | 'Sedan' | 'Performance';
  showroom: string;                  // e.g., "DFC"
  channel: string;                   // e.g., "Instagram"
  duration: number;                  // minutes
  completed: boolean;
  convertedToSale: boolean;
  customerAge: number;
  customerGender: 'Male' | 'Female';
  timeToTestDrive: number;           // days from lead to test drive
  salesConsultant: string;
  funnelStage: 'request' | 'qualified' | 'booked' | 'completed' | 'order' | 'invoice';
  occurrence: 'first_show' | 'rescheduled' | 'cancelled' | 'no_show';
}

// Showroom short names for the records
const _SHOWROOM_SHORT_NAMES = UAE_SHOWROOMS_DATA.map(s => s.shortName);

// Sales consultants per showroom
const SALES_CONSULTANTS: Record<string, string[]> = {
  'DFC': ['Ahmad Rashid', 'Nadia Al Hashemi', 'Hassan Omar'],
  'Sheikh Zayed Road': ['Salim Al Kaabi', 'Reem Al Mazrouei', 'Faisal Mahmoud'],
  'DIP': ['Tariq Al Mulla', 'Noora Al Shamsi'],
  'Abu Dhabi': ['Maryam Al Dhaheri', 'Khalid Al Remeithi', 'Aisha Saeed'],
  'Sharjah': ['Younis Al Hosani', 'Latifa Al Qassimi'],
  'Khorfakkan': ['Saif Al Ketbi'],
  'Ras Al Khaimah': ['Rashid Al Sharhan', 'Amna Al Tunaiji'],
  'Ajman': ['Mohammed Al Suwaidi', 'Fatima Al Zaabi'],
  'Fujairah': ['Omar Al Nuaimi'],
  'Umm Al Quwain': ['Sara Al Hammadi'],
  'Al Ain': ['Ibrahim Al Nuaimi', 'Huda Al Darmaki']
};

// Model weights (popularity distribution)
const MODEL_WEIGHTS: Record<string, number> = {
  'RX350': 15, 'LX600': 13, 'NX350': 11, 'RX500h': 8, 'NX350h': 6,
  'UX300h': 4, 'LX700h': 4, 'RX350h': 3,
  'ES350': 9, 'IS300': 5, 'ES300h': 3, 'LS500h': 2, 'LS350': 2,
  'LC500': 1.5, 'RC350': 1.3, 'RC F': 1, 'LC500 Convertible': 0.7
};

// Showroom weights (volume distribution)
const SHOWROOM_WEIGHTS: Record<string, number> = {
  'DFC': 20, 'Sheikh Zayed Road': 17, 'Abu Dhabi': 15, 'DIP': 13,
  'Sharjah': 9, 'Al Ain': 5, 'Ajman': 4, 'Ras Al Khaimah': 3,
  'Khorfakkan': 2.5, 'Fujairah': 2, 'Umm Al Quwain': 1.5
};

// Channel weights
const CHANNEL_WEIGHTS: Record<string, number> = {
  'Website Organic': 20, 'Website Paid': 17, 'Instagram': 15,
  'Facebook': 12, 'Google Search': 10, 'CRM': 9,
  'TikTok': 7, 'Call Center': 6, 'WhatsApp': 5
};

// Age group weights
const AGE_WEIGHTS = [
  { min: 18, max: 25, weight: 7 },
  { min: 26, max: 35, weight: 35 },
  { min: 36, max: 45, weight: 32 },
  { min: 46, max: 55, weight: 18 },
  { min: 56, max: 70, weight: 8 }
];

// Weighted random selection
function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let random = Math.random() * total;
  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// Get model type
function getModelType(model: string): 'SUV' | 'Sedan' | 'Performance' {
  if (LEXUS_MODEL_TYPES.SUV.includes(model as any)) return 'SUV';
  if (LEXUS_MODEL_TYPES.Sedan.includes(model as any)) return 'Sedan';
  return 'Performance';
}

// Generate random age based on weights
function generateAge(): number {
  const total = AGE_WEIGHTS.reduce((sum, g) => sum + g.weight, 0);
  let random = Math.random() * total;
  for (const group of AGE_WEIGHTS) {
    random -= group.weight;
    if (random <= 0) {
      return group.min + Math.floor(Math.random() * (group.max - group.min + 1));
    }
  }
  return 35; // Default
}

// Generate occurrence based on completion status
function generateOccurrence(completed: boolean): TestDriveRecord['occurrence'] {
  if (completed) {
    return Math.random() < 0.8 ? 'first_show' : 'rescheduled';
  } else {
    return Math.random() < 0.6 ? 'cancelled' : 'no_show';
  }
}

// Generate funnel stage
function generateFunnelStage(completed: boolean, converted: boolean): TestDriveRecord['funnelStage'] {
  if (converted) {
    return Math.random() < 0.83 ? 'invoice' : 'order';
  }
  if (completed) {
    return 'completed';
  }
  const stages: TestDriveRecord['funnelStage'][] = ['request', 'qualified', 'booked'];
  return stages[Math.floor(Math.random() * stages.length)];
}

// Generate test drive duration based on model
function generateDuration(model: string): number {
  const durationData = durationByModelData.find(d => d.model === model);
  if (durationData) {
    const { minDuration, maxDuration, avgDuration } = durationData;
    // Normal-ish distribution around average
    const spread = (maxDuration - minDuration) / 4;
    const deviation = (Math.random() - 0.5) * 2 * spread;
    return Math.round(Math.max(minDuration, Math.min(maxDuration, avgDuration + deviation)));
  }
  return 30; // Default 30 minutes
}

// Generate time to test drive based on showroom
function generateTimeToTestDrive(showroom: string): number {
  const ttdData = timeToTestDriveData.find(d => d.showroom === showroom);
  if (ttdData) {
    const { minDays, maxDays, avgDays } = ttdData;
    const spread = (maxDays - minDays) / 4;
    const deviation = (Math.random() - 0.5) * 2 * spread;
    return Math.round(Math.max(minDays, Math.min(maxDays, avgDays + deviation)));
  }
  return 3; // Default 3 days
}

// Generate the base dataset
function generateTestDriveRecords(count: number = 8000): TestDriveRecord[] {
  const records: TestDriveRecord[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);
  const endDate = new Date();
  const dateRange = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    // Random date within the 3-year range
    const recordDate = new Date(startDate.getTime() + Math.random() * dateRange);
    const dateStr = recordDate.toISOString().split('T')[0];

    // Weighted selections
    const model = weightedRandom(MODEL_WEIGHTS);
    const showroom = weightedRandom(SHOWROOM_WEIGHTS);
    const channel = weightedRandom(CHANNEL_WEIGHTS);

    // Get sales consultant for showroom
    const consultants = SALES_CONSULTANTS[showroom] || ['Unknown'];
    const salesConsultant = consultants[Math.floor(Math.random() * consultants.length)];

    // Demographics
    const customerAge = generateAge();
    const customerGender: 'Male' | 'Female' = Math.random() < 0.7 ? 'Male' : 'Female';

    // Completion and conversion (correlated)
    const completed = Math.random() < 0.8;
    const convertedToSale = completed && Math.random() < 0.25;

    records.push({
      id: `td-${i.toString().padStart(6, '0')}`,
      date: dateStr,
      model,
      modelType: getModelType(model),
      showroom,
      channel,
      duration: completed ? generateDuration(model) : 0,
      completed,
      convertedToSale,
      customerAge,
      customerGender,
      timeToTestDrive: generateTimeToTestDrive(showroom),
      salesConsultant,
      funnelStage: generateFunnelStage(completed, convertedToSale),
      occurrence: generateOccurrence(completed)
    });
  }

  // Sort by date
  return records.sort((a, b) => a.date.localeCompare(b.date));
}

// Export the generated records
export const testDriveRecords = generateTestDriveRecords(8000);

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface GlobalFilters {
  startDate: string | null;
  endDate: string | null;
  model: string | null;
  showroom: string | null;
  channel: string | null;
}

// Helper function to filter records
export function filterRecords(records: TestDriveRecord[], filters: GlobalFilters): TestDriveRecord[] {
  return records.filter(record => {
    // Date range filter
    if (filters.startDate && record.date < filters.startDate) return false;
    if (filters.endDate && record.date > filters.endDate) return false;

    // Model filter
    if (filters.model && record.model !== filters.model) return false;

    // Showroom filter
    if (filters.showroom && record.showroom !== filters.showroom) return false;

    // Channel filter
    if (filters.channel && record.channel !== filters.channel) return false;

    return true;
  });
}
