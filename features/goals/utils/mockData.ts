// Mock Analytics Data for Enhanced Dashboard Experience
// This provides realistic data patterns when user data is sparse

export interface MockAnalyticsData {
  // Time-based productivity data
  hourlyProductivity: Array<{
    hour: number;
    completions: number;
    efficiency: number;
    energyLevel: number;
  }>;
  
  // Weekly patterns with mood and energy
  weeklyPatterns: Array<{
    day: string;
    completions: number;
    mood: number; // 1-10
    energyLevel: number; // 1-10
    focusTime: number; // hours
  }>;
  
  // Monthly trends
  monthlyTrends: Array<{
    month: string;
    completions: number;
    efficiency: number;
    burnoutRisk: number;
    satisfaction: number;
  }>;
  
  // Category performance with depth
  categoryAnalytics: Array<{
    name: string;
    completions: number;
    averageTime: number;
    difficulty: number;
    satisfaction: number;
    burnoutRisk: number;
    color: string;
  }>;
  
  // Priority effectiveness over time
  priorityTrends: Array<{
    period: string;
    high: number;
    medium: number;
    low: number;
    urgent: number;
  }>;
  
  // Focus and distraction data
  focusAnalytics: {
    deepWorkSessions: Array<{
      date: string;
      duration: number;
      quality: number;
      distractions: number;
    }>;
    distractionPatterns: Array<{
      time: string;
      type: string;
      frequency: number;
      impact: number;
    }>;
  };
  
  // Collaboration and team metrics
  collaborationData: Array<{
    type: 'solo' | 'pair' | 'team' | 'meeting';
    completions: number;
    efficiency: number;
    satisfaction: number;
  }>;
  
  // Habit and streak data
  habitData: {
    streaks: Array<{
      habit: string;
      current: number;
      longest: number;
      consistency: number;
    }>;
    habitCorrelation: Array<{
      habit: string;
      productivity: number;
      mood: number;
      energy: number;
    }>;
  };
  
  // Time boxing and planning effectiveness
  planningData: Array<{
    planType: string;
    estimated: number;
    actual: number;
    efficiency: number;
    satisfaction: number;
  }>;
  
  // Goal achievement patterns
  goalPatterns: Array<{
    goalType: string;
    completionRate: number;
    averageDuration: number;
    satisfactionScore: number;
    difficultyRating: number;
  }>;
  
  // Productivity by environment/context
  environmentData: Array<{
    environment: string;
    productivity: number;
    focus: number;
    creativity: number;
    stress: number;
  }>;
  
  // Seasonal and temporal patterns
  temporalPatterns: {
    seasonal: Array<{
      season: string;
      productivity: number;
      mood: number;
      motivation: number;
    }>;
    timeOfMonth: Array<{
      week: string;
      productivity: number;
      stress: number;
      creativity: number;
    }>;
  };
  
  // Workload and capacity analysis
  capacityData: Array<{
    period: string;
    planned: number;
    completed: number;
    capacity: number;
    overload: number;
  }>;
  
  // Skill development tracking
  skillData: Array<{
    skill: string;
    level: number;
    improvement: number;
    practiceTime: number;
    confidence: number;
  }>;
}

export const generateMockAnalyticsData = (): MockAnalyticsData => {
  // Generate hourly productivity (0-23 hours)
  const hourlyProductivity = Array.from({ length: 24 }, (_, hour) => {
    let baseProductivity = 2;
    let efficiency = 50;
    let energy = 50;
    
    // Morning peak (6-10 AM)
    if (hour >= 6 && hour <= 10) {
      baseProductivity = 8 + Math.random() * 4;
      efficiency = 75 + Math.random() * 20;
      energy = 80 + Math.random() * 15;
    }
    // Afternoon dip (1-3 PM)
    else if (hour >= 13 && hour <= 15) {
      baseProductivity = 3 + Math.random() * 2;
      efficiency = 45 + Math.random() * 15;
      energy = 40 + Math.random() * 20;
    }
    // Evening focus (7-9 PM)
    else if (hour >= 19 && hour <= 21) {
      baseProductivity = 6 + Math.random() * 3;
      efficiency = 65 + Math.random() * 20;
      energy = 60 + Math.random() * 20;
    }
    // Night hours (10 PM - 5 AM)
    else if (hour >= 22 || hour <= 5) {
      baseProductivity = Math.random() * 2;
      efficiency = 20 + Math.random() * 15;
      energy = 15 + Math.random() * 10;
    }
    // Regular work hours
    else {
      baseProductivity = 4 + Math.random() * 3;
      efficiency = 60 + Math.random() * 20;
      energy = 65 + Math.random() * 20;
    }
    
    return {
      hour,
      completions: Math.round(baseProductivity),
      efficiency: Math.round(efficiency),
      energyLevel: Math.round(energy)
    };
  });
  
  // Generate weekly patterns
  const weeklyPatterns = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ].map((day, index) => {
    let completions = 5 + Math.random() * 8;
    let mood = 6;
    let energy = 6;
    let focusTime = 4;
    
    // Monday blues
    if (index === 0) {
      completions = 3 + Math.random() * 4;
      mood = 4 + Math.random() * 2;
      energy = 5 + Math.random() * 2;
      focusTime = 2 + Math.random() * 2;
    }
    // Mid-week peak
    else if (index >= 1 && index <= 3) {
      completions = 8 + Math.random() * 6;
      mood = 7 + Math.random() * 2;
      energy = 7 + Math.random() * 2;
      focusTime = 5 + Math.random() * 3;
    }
    // Friday wind-down
    else if (index === 4) {
      completions = 6 + Math.random() * 4;
      mood = 8 + Math.random() * 1;
      energy = 6 + Math.random() * 2;
      focusTime = 3 + Math.random() * 2;
    }
    // Weekend
    else {
      completions = 2 + Math.random() * 3;
      mood = 8 + Math.random() * 2;
      energy = 7 + Math.random() * 2;
      focusTime = 1 + Math.random() * 2;
    }
    
    return {
      day,
      completions: Math.round(completions),
      mood: Math.round(mood * 10) / 10,
      energyLevel: Math.round(energy * 10) / 10,
      focusTime: Math.round(focusTime * 10) / 10
    };
  });
  
  // Generate monthly trends (last 12 months)
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const baseCompletions = 45 + Math.random() * 30;
    const seasonal = Math.sin((i / 12) * 2 * Math.PI) * 10; // Seasonal variation
    
    return {
      month: monthName,
      completions: Math.round(baseCompletions + seasonal),
      efficiency: Math.round(65 + Math.random() * 25),
      burnoutRisk: Math.round(20 + Math.random() * 40),
      satisfaction: Math.round(70 + Math.random() * 25)
    };
  });
  
  // Generate category analytics
  const categoryAnalytics = [
    {
      name: 'Work',
      completions: 45,
      averageTime: 3.2,
      difficulty: 7,
      satisfaction: 6.5,
      burnoutRisk: 65,
      color: '#3b82f6'
    },
    {
      name: 'Personal',
      completions: 28,
      averageTime: 2.1,
      difficulty: 5,
      satisfaction: 8.2,
      burnoutRisk: 25,
      color: '#10b981'
    },
    {
      name: 'Learning',
      completions: 22,
      averageTime: 4.5,
      difficulty: 8,
      satisfaction: 9.1,
      burnoutRisk: 35,
      color: '#8b5cf6'
    },
    {
      name: 'Health',
      completions: 35,
      averageTime: 1.8,
      difficulty: 4,
      satisfaction: 7.8,
      burnoutRisk: 20,
      color: '#06b6d4'
    },
    {
      name: 'Creative',
      completions: 18,
      averageTime: 5.2,
      difficulty: 6,
      satisfaction: 9.5,
      burnoutRisk: 15,
      color: '#f59e0b'
    },
    {
      name: 'Social',
      completions: 15,
      averageTime: 2.8,
      difficulty: 3,
      satisfaction: 8.7,
      burnoutRisk: 10,
      color: '#ef4444'
    }
  ];
  
  // Generate priority trends (last 8 weeks)
  const priorityTrends = Array.from({ length: 8 }, (_, i) => ({
    period: `W${i + 1}`,
    high: Math.round(8 + Math.random() * 6),
    medium: Math.round(12 + Math.random() * 8),
    low: Math.round(6 + Math.random() * 4),
    urgent: Math.round(3 + Math.random() * 3)
  }));
  
  // Generate focus analytics
  const focusAnalytics = {
    deepWorkSessions: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        duration: Math.round((2 + Math.random() * 4) * 10) / 10,
        quality: Math.round((6 + Math.random() * 4) * 10) / 10,
        distractions: Math.round(Math.random() * 8)
      };
    }),
    distractionPatterns: [
      { time: '09:00', type: 'Email', frequency: 8, impact: 6 },
      { time: '11:00', type: 'Meetings', frequency: 12, impact: 8 },
      { time: '14:00', type: 'Social Media', frequency: 15, impact: 7 },
      { time: '16:00', type: 'Phone Calls', frequency: 5, impact: 9 },
      { time: '18:00', type: 'Notifications', frequency: 20, impact: 5 }
    ]
  };
  
  // Generate collaboration data
  const collaborationData: Array<{
    type: 'solo' | 'pair' | 'team' | 'meeting';
    completions: number;
    efficiency: number;
    satisfaction: number;
  }> = [
    { type: 'solo', completions: 85, efficiency: 88, satisfaction: 8.2 },
    { type: 'pair', completions: 45, efficiency: 92, satisfaction: 8.8 },
    { type: 'team', completions: 28, efficiency: 75, satisfaction: 7.5 },
    { type: 'meeting', completions: 12, efficiency: 45, satisfaction: 5.2 }
  ];
  
  // Generate habit data
  const habitData = {
    streaks: [
      { habit: 'Morning Exercise', current: 12, longest: 28, consistency: 85 },
      { habit: 'Daily Planning', current: 45, longest: 67, consistency: 92 },
      { habit: 'Reading', current: 8, longest: 15, consistency: 65 },
      { habit: 'Meditation', current: 22, longest: 35, consistency: 78 },
      { habit: 'Journaling', current: 5, longest: 18, consistency: 58 }
    ],
    habitCorrelation: [
      { habit: 'Morning Exercise', productivity: 85, mood: 88, energy: 92 },
      { habit: 'Daily Planning', productivity: 95, mood: 75, energy: 70 },
      { habit: 'Reading', productivity: 70, mood: 82, energy: 65 },
      { habit: 'Meditation', productivity: 78, mood: 95, energy: 85 },
      { habit: 'Journaling', productivity: 68, mood: 90, energy: 72 }
    ]
  };
  
  // Generate planning effectiveness data
  const planningData = [
    { planType: 'Daily', estimated: 6.5, actual: 5.8, efficiency: 89, satisfaction: 8.2 },
    { planType: 'Weekly', estimated: 32, actual: 28, efficiency: 87, satisfaction: 8.0 },
    { planType: 'Monthly', estimated: 45, actual: 38, efficiency: 84, satisfaction: 7.5 },
    { planType: 'No Plan', estimated: 8, actual: 4.2, efficiency: 52, satisfaction: 5.5 }
  ];
  
  // Generate goal patterns
  const goalPatterns = [
    { goalType: 'Career', completionRate: 78, averageDuration: 180, satisfactionScore: 8.2, difficultyRating: 7 },
    { goalType: 'Health', completionRate: 85, averageDuration: 90, satisfactionScore: 8.8, difficultyRating: 5 },
    { goalType: 'Learning', completionRate: 72, averageDuration: 120, satisfactionScore: 9.1, difficultyRating: 8 },
    { goalType: 'Personal', completionRate: 88, averageDuration: 60, satisfactionScore: 8.5, difficultyRating: 4 },
    { goalType: 'Creative', completionRate: 65, averageDuration: 150, satisfactionScore: 9.3, difficultyRating: 6 }
  ];
  
  // Generate environment data
  const environmentData = [
    { environment: 'Home Office', productivity: 85, focus: 82, creativity: 78, stress: 25 },
    { environment: 'Coffee Shop', productivity: 72, focus: 68, creativity: 88, stress: 45 },
    { environment: 'Library', productivity: 88, focus: 95, creativity: 65, stress: 15 },
    { environment: 'Co-working', productivity: 78, focus: 75, creativity: 85, stress: 35 },
    { environment: 'Outdoors', productivity: 45, focus: 38, creativity: 95, stress: 5 }
  ];
  
  // Generate temporal patterns
  const temporalPatterns = {
    seasonal: [
      { season: 'Spring', productivity: 88, mood: 85, motivation: 92 },
      { season: 'Summer', productivity: 75, mood: 92, motivation: 82 },
      { season: 'Fall', productivity: 92, mood: 78, motivation: 88 },
      { season: 'Winter', productivity: 68, mood: 65, motivation: 72 }
    ],
    timeOfMonth: [
      { week: 'Week 1', productivity: 95, stress: 25, creativity: 85 },
      { week: 'Week 2', productivity: 88, stress: 35, creativity: 82 },
      { week: 'Week 3', productivity: 82, stress: 55, creativity: 78 },
      { week: 'Week 4', productivity: 68, stress: 75, creativity: 88 }
    ]
  };
  
  // Generate capacity data
  const capacityData = Array.from({ length: 12 }, (_, i) => ({
    period: `M${i + 1}`,
    planned: Math.round(40 + Math.random() * 20),
    completed: Math.round(35 + Math.random() * 15),
    capacity: Math.round(50 + Math.random() * 15),
    overload: Math.round(Math.random() * 25)
  }));
  
  // Generate skill data
  const skillData = [
    { skill: 'Project Management', level: 8.5, improvement: 1.2, practiceTime: 120, confidence: 88 },
    { skill: 'Programming', level: 7.8, improvement: 0.8, practiceTime: 180, confidence: 82 },
    { skill: 'Design', level: 6.2, improvement: 1.8, practiceTime: 90, confidence: 75 },
    { skill: 'Communication', level: 8.1, improvement: 0.5, practiceTime: 60, confidence: 85 },
    { skill: 'Leadership', level: 7.0, improvement: 1.1, practiceTime: 45, confidence: 78 }
  ];
  
  return {
    hourlyProductivity,
    weeklyPatterns,
    monthlyTrends,
    categoryAnalytics,
    priorityTrends,
    focusAnalytics,
    collaborationData,
    habitData,
    planningData,
    goalPatterns,
    environmentData,
    temporalPatterns,
    capacityData,
    skillData
  };
};

// Generate static instance for immediate use
export const mockAnalyticsData = generateMockAnalyticsData();
