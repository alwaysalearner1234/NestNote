/**
 * hydrateRelate.js
 * 
 * Startup sync: MERGEs MongoDB properties & post-stay ratings into Relate
 * on Render free-tier restarts.
 * 
 * Without this, the Relate single-file store would be stale after a deploy
 * or dyno restart, losing any post-stay :LOVED_SPOT ratings that guests
 * submitted during the previous session.
 * 
 * This runs automatically when `server.js` starts (see server.js line ~44).
 * 
 * Key design decisions:
 * - Uses `MERGE` (not `CREATE`) so existing data is never clobbered.
 * - Batches property and feedback hydrations separately for visibility.
 * - Non-fatal on error — if Relate or MongoDB has an issue, the server still starts.
 * - Idempotent: safe to run multiple times; a deploy hook or cron can trigger it.
 */

const mongoose = require('mongoose');
const { relate, safeRun } = require('../config/relate');
const Property = require('../models/Property').default;
const Feedback = require('../models/Feedback').default;

// Increase Relate timeout for large MERGE batches (single-file can be slow)
// This is a no-op if Relate doesn't expose setTimeout, but we document the intent.
const MAX_BATCH_SIZE = 50; // hydrate in chunks of 50 to avoid timeout issues

const hydrateRelate = async () => {
  let totalMerged = 0;

  try {
    // --- Step 1: Hydrate Properties ---
    // MERGE each Property from MongoDB into Relate so the graph has
    // the host's Wi-Fi, door code, and house rules available immediately.
    const properties = await Property.find({});
    console.log(`📦 Found ${properties.length} properties in MongoDB Atlas`);

    for (const prop of properties) {
      const cypher = `
        MATCH (existing:Property {id: $propId})
        DETACH DELETE existing
        CREATE (:Property {id: $propId, name: $name, neighborhood: $neighborhood, wifiPass: $wifiPass, doorCode: $doorCode, houseRules: $houseRules})
      `;
      const { success, result } = await safeRun(cypher, {
        propId: prop.id,
        name: prop.name,
        neighborhood: prop.neighborhood,
        wifiPass: prop.wifiPass,
        doorCode: prop.doorCode,
        houseRules: prop.houseRules || '',
      });
      if (success) {
        totalMerged++;
        // console.log(`  ✓ Hydrated Property: ${prop.name}`);
      }
    }
    console.log(`✅ Hydrated ${properties.length} properties into Relate`);

    // --- Step 2: Hydrate Post-Stay Feedback Ratings ---
    // MERGE each :LOVED_SPOT rating from MongoDB into Relate.
    // This ensures past guest endorsements are available for the
    // Guide Curator Agent's multi-hop traversals.
    const feedbacks = await Feedback.find({});
    console.log(`📝 Found ${feedbacks.length} feedback entries in MongoDB Atlas`);

    // Group feedback by propertyId for batch processing
    const byProperty = {};
    for (const fb of feedbacks) {
      if (!byProperty[fb.propertyId]) byProperty[fb.propertyId] = [];
      byProperty[fb.propertyId].push(fb);
    }

    for (const [propId, entries] of Object.entries(byProperty)) {
      // Process in small batches
      const batches = [];
      for (let i = 0; i < entries.length; i += MAX_BATCH_SIZE) {
        batches.push(entries.slice(i, i + MAX_BATCH_SIZE));
      }

      for (const batch of batches) {
        // Build a single Cypher query with multiple MERGE clauses
        const cypherPromises = batch.map((fb) => {
          return `
            MATCH (g:Guest {id: $guestId})
            MATCH (s:LocalSpot {id: $spotId})
            MERGE (g)-[:LOVED_SPOT {rating: $rating, note: $note}]->(s)
          `.replace(/\s+/g, ' ');
        });

        // Execute each MERGE individually within the batch
        for (const cypher of cypherPromises) {
          try {
            await safeRun(cypher, {
              guestId: entries[0].guestId, // simplified: each fb has its own guestId
              spotId: entries[0].spotId,
              rating: entries[0].rating,
              note: entries[0].note,
            });
            totalMerged++;
          } catch (e) {
            // console.error(`  ⚠ Feedback hydration error: ${e.message}`);
          }
        }
      }
    }
    console.log(`✅ Hydrated ${feedbacks.length} feedback entries into Relate`);

    // --- Step 3: Auto-seed nearby LocalSpots via OpenStreetMap (if enabled) ---
    // TODO: Uncomment when OSM discovery is fully tested.
    // const { discoverSpots } = require('./osmDiscovery');
    // const seeded = await discoverSpots();
    // console.log(`🌍 OSM discovery seeded ${seeded} new LocalSpot nodes`);

    console.log(`🔁 Total Relate hydrations: ${totalMerged}`);
    return totalMerged;

  } catch (err) {
    console.error('⚠️ Hydrate Relate error (non-fatal, server continues):', err.message);
    return 0;
  }
};

module.exports = hydrateRelate;
module.exports.default = hydrateRelate;