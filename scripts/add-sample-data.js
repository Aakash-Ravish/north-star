// Sample mood data generator for testing charts
// Run this in browser console on journal page to add test data

function addSampleMoodData() {
  const sampleEntries = [];
  const now = new Date();

  // Generate mood entries for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random number of entries per day (0-3)
    const entriesPerDay = Math.floor(Math.random() * 4);

    for (let j = 0; j < entriesPerDay; j++) {
      const mood = Math.floor(Math.random() * 5) + 1; // 1-5

      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        userId: 'test-user',
        mood: mood,
        timestamp: date.toISOString(),
        note: getSampleNote(mood),
        tags: [],
        activities: []
      };

      sampleEntries.push(entry);
    }
  }

  // Save to localStorage
  localStorage.setItem('northstar_mood_entries', JSON.stringify(sampleEntries));
  console.log(`Added ${sampleEntries.length} sample mood entries`);

  // Reload the page to see the data
  window.location.reload();
}

function getSampleNote(mood) {
  const notes = {
    1: ["Feeling really down today", "Having a tough time", "Everything feels overwhelming"],
    2: ["Not the best day", "Feeling a bit low", "Could be better"],
    3: ["Doing okay", "Just another day", "Feeling neutral"],
    4: ["Having a good day!", "Feeling positive", "Things are going well"],
    5: ["Amazing day!", "Feeling fantastic!", "Everything is wonderful!"]
  };

  const moodNotes = notes[mood];
  return Math.random() < 0.7 ? moodNotes[Math.floor(Math.random() * moodNotes.length)] : undefined;
}

// Auto-run if this script is executed
if (typeof window !== 'undefined') {
  addSampleMoodData();
}

console.log('Sample mood data script loaded. Run addSampleMoodData() to generate test data.');