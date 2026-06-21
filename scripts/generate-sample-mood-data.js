// Sample mood data generator for testing Chart.js integration
// Run this in browser console while on journal page to populate sample data

function generateSampleMoodData() {
  const sampleData = [];
  const today = new Date();

  // Generate 30 days of sample data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate 1-3 entries per day with random moods
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < entriesPerDay; j++) {
      // Create time variation throughout the day
      const hour = Math.floor(Math.random() * 16) + 7; // 7 AM to 11 PM
      const minute = Math.floor(Math.random() * 60);

      const entryDate = new Date(date);
      entryDate.setHours(hour, minute, 0, 0);

      // Generate mood with some patterns
      let mood;
      if (i < 7) { // Last week - improving trend
        mood = Math.floor(Math.random() * 2) + 3; // 3-4
        if (Math.random() > 0.8) mood = 5; // Occasional high
      } else if (i < 14) { // Two weeks ago - mixed
        mood = Math.floor(Math.random() * 5) + 1; // 1-5
      } else { // Earlier - slightly lower
        mood = Math.floor(Math.random() * 3) + 1; // 1-3
        if (Math.random() > 0.9) mood = 4; // Occasional good day
      }

      const notes = [
        "Great day at work!", "Feeling a bit overwhelmed", "Had a wonderful walk",
        "Spent time with friends", "Feeling grateful", "A bit tired today",
        "Accomplished my goals", "Feeling anxious about tomorrow", "Beautiful sunset",
        "Good workout session", "Feeling stressed", "Peaceful evening",
        "Exciting news today!", "Missing family", "Productive day",
        "Feeling creative", "A bit lonely", "Great conversation with a friend"
      ];

      sampleData.push({
        id: `sample_${i}_${j}_${Date.now()}`,
        userId: 'sample_user',
        mood: mood,
        note: Math.random() > 0.3 ? notes[Math.floor(Math.random() * notes.length)] : undefined,
        timestamp: entryDate.toISOString(),
        tags: [],
        activities: []
      });
    }
  }

  // Save to localStorage
  localStorage.setItem('northstar_mood_entries', JSON.stringify(sampleData));

  console.log(`Generated ${sampleData.length} sample mood entries over 30 days`);
  console.log('Refresh the page to see the data in charts!');

  return sampleData;
}

// Auto-run if script is executed
if (typeof window !== 'undefined') {
  console.log('🧪 Sample Data Generator Ready!');
  console.log('Run generateSampleMoodData() to create sample mood entries');

  // Export to window for easy access
  window.generateSampleMoodData = generateSampleMoodData;
}