export interface VitalsInput {
  sleepHours: number;
  nutritionScore: number; // 0-100
  activityMinutes: number;
  stressScore: number; // 0-100 (lower is better)
  libidoLevel?: 'low' | 'normal' | 'high';
  gymDay?: boolean;
}

export interface VitalityResult {
  score: number;
  gaps: string[];
}

export function calculateVitality(data: VitalsInput): VitalityResult {
  const gaps = new Set<string>();
  
  // 1. Sleep (30%) - Target is 8 hours
  let sleepContribution = (data.sleepHours / 8) * 30;
  if (sleepContribution > 30) sleepContribution = 30;
  
  if (data.sleepHours < 6) {
    gaps.add('Recovery Gap');
  }

  // 2. Nutrition (30%)
  let nutritionContribution = (data.nutritionScore / 100) * 30;
  if (nutritionContribution > 30) nutritionContribution = 30;

  // 3. Activity (25%) - Target 60 mins
  let activityContribution = (data.activityMinutes / 60) * 25;
  if (activityContribution > 25) activityContribution = 25;
  
  if (data.activityMinutes < 30) {
    gaps.add('Circulation/Activity Gap');
  }

  // 4. Stress (15%) - Invert score assuming 100 stress is bad
  let stressContribution = ((100 - data.stressScore) / 100) * 15;
  if (stressContribution < 0) stressContribution = 0;
  
  if (data.stressScore >= 70 || data.libidoLevel === 'low') {
    gaps.add('Stress/Libido Gap');
  }
  
  if (data.gymDay) {
    gaps.add('High Output/Gym Day');
  }

  const score = Math.round(
    sleepContribution + nutritionContribution + activityContribution + stressContribution
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    gaps: Array.from(gaps)
  };
}

export function getProductRecommendation(gaps: string[]) {
  if (gaps.length === 0) return null;

  const gap = gaps[0];
  switch (gap) {
    case 'Recovery Gap':
      return { name: 'Melatonin/Sleep Squares', reason: 'Deep sleep and recovery are critical baselines.' };
    case 'Circulation/Activity Gap':
      return { name: 'Sport/Energy Squares', reason: 'Boost circulation and physical output.' };
    case 'Stress/Libido Gap':
      return { name: 'Intimacy Squares', reason: 'Formulated to manage stress and support libido.' };
    case 'High Output/Gym Day':
      return { name: 'Gym/Pre-workout Squares', reason: 'Optimal fuel for high-output training.' };
    default:
      return null;
  }
}
