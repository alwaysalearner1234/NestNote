const { Database } = require('@relate/relate');

async function init() {
  // Remove old file if exists
  const fs = require('fs');
  const path = require('path');
  const rlPath = path.join(__dirname, 'data', 'welcome-kit.rl');
  if (fs.existsSync(rlPath)) {
    fs.unlinkSync(rlPath);
    console.log('Removed old .rl file');
  }

  const db = new Database(rlPath);
  try {
    await db.connect();
    console.log('✅ Connected to single-file Relate store');

    // Create sample data
    const createResult = await db.cypher(`
      MERGE (:Property {id: "prop-1", name: "Cozy Downtown Loft", neighborhood: "Downtown"})
      MERGE (:LocalSpot {id: "spot-cafe-1", name: "Morning Brew Cafe", category: "Cafe", description: "Artisanal coffee", priceTier: "$", lat: 40.7128, lon: -74.0060})
      MERGE (:LocalSpot {id: "spot-restaurant-1", name: "The Velvet Grill", category: "Restaurant", description: "Farm-to-table", priceTier: "$$", lat: 40.7130, lon: -74.0062})
      MERGE (:VibeTag {name: "coffee"})
      MERGE (:VibeTag {name: "jazz"})
      MERGE (:Guest {id: "guest-1", name: "Alex", groupType: "couple"})
      MERGE (guest1)-[:PREFERS]->(v:VibeTag {name: "coffee"})
      MERGE (guest1)-[:PREFERS]->(v:VibeTag {name: "jazz"})
      MERGE (prop-1)-[:NEAR {walkMins: 5}]->(spot-cafe-1)
      MERGE (prop-1)-[:NEAR {walkMins: 12}]->(spot-restaurant-1)
      MERGE (guest1)-[:LOVED_SPOT {rating: 5, note: "Great coffee!"}]->(spot-cafe-1)
      
      RETURN 'Done';
    `);
    console.log('✅ Sample data seeded:', JSON.stringify(createResult).substring(0, 200));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

init();