export const partnerProfiles: Record<string, any> = {
  'KLR-882': {
    name: 'Sarah',
    avatar_color: 'bg-pink-400',
    tagline: "Early bird, high energy.",
    vitalsInput: {
      sleepHours: 8.5,
      nutritionScore: 90,
      activityMinutes: 60,
      stressScore: 15
    },
    insights: [
      {
        title: "Circadian Sync 🌙",
        text: "You both prioritize deep recovery. Syncing your bedtimes could boost your morning energy by 14%!",
        match: true
      },
      {
        title: "Dynamic Duo ⚡",
        text: "Sarah is a cardio bunny while you lift heavy. Together, you cover the entire physical spectrum perfectly.",
        match: true
      },
      {
        title: "Zen Balance 🧘‍♀️",
        text: "When your stress spikes, Sarah's cortisol stays low. She is your literal grounding wire.",
        match: false // Meaning they balance each other
      }
    ],
    synergy_score: 94,
    headline: "You two are a match made in REM sleep! ✨"
  },
  'KLR-101': {
    name: 'David',
    avatar_color: 'bg-blue-400',
    tagline: "Night owl, tech bro.",
    vitalsInput: {
      sleepHours: 5.5,
      nutritionScore: 70,
      activityMinutes: 30,
      stressScore: 65
    },
    insights: [
      {
        title: "The Anchor & The Sail ⛵",
        text: "David's stress runs high. Your stable routines are exactly what he needs to ground his cortisol.",
        match: false
      },
      {
        title: "Midnight Snackers 🥑",
        text: "You both have similar nutrition rhythms, but watch those late-night carb spikes together!",
        match: true
      }
    ],
    synergy_score: 76,
    headline: "Opposites attract and balance each other! ⚖️"
  }
};
