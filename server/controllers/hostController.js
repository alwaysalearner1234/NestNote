/**
 * hostController.js
 * 
 * Logic for property creation, booking creation, approval & concierge chat.
 * 
 * Member 1 responsibilities (50/50 work division):
 * - Property onboarding form handling
 * - Auto-seed neighborhood graph (OSM + Relate)
 * - Host review & approval modal
 * - QR code generation for guest guides
 * - Concierge chat endpoint (grounded Q&A)
 */

const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { discoverSpots } = require('../utils/osmDiscovery');
const { relate } = require('../config/relate');
const { draftWelcomeNote } = require('../utils/llmClient');
const qrcode = require('qrcode');

// --- POST /api/properties ---
// Host one-time property setup form
// Body: { name, neighborhood, address, wifiPass, doorCode, houseRules }
router.post('/properties', async (req, res) => {
  try {
    const {
      name,
      neighborhood,
      address,
      wifiPass,
      doorCode,
      houseRules,
    } = req.body;

    if (!name || !neighborhood) {
      return res
        .status(400)
        .json({ message: 'Name and neighborhood are required' });
    }

    // Create property in MongoDB Atlas
    const property = new Property({
      hostId: req.session?.userId || 'host-unknown',
      name,
      neighborhood,
      address: address || '',
      wifiPass,
      doorCode,
      houseRules: houseRules || '',
    });

    await property.save();

    // --- Auto-seed neighborhood graph via OpenStreetMap ---
    // This queries Nominatim + Overpass and links nearby :LocalSpot nodes
    // to the Property in the Relate single-file store.
    try {
      const seeded = await discoverSpots(address || name);
      // console.log(`  🌍 Auto-seeded ${seeded} nearby spots via OSM`);
    } catch (osmErr) {
      console.error('⚠️ OSM auto-seed error (non-fatal):', osmErr.message);
    }

    // --- Also seed a minimal base graph if the .rl file is empty ---
    // This ensures the hackathon demo works out-of-the-box without OSM dependencies.
    // In production, the host would run this manually or it'd run on first boot.
    // (Handled by seedRelate.js on first setup.)

    console.log(`✅ Property saved: ${name} in ${neighborhood}`);
    res.status(201).json({
      message: 'Property created successfully',
      propertyId: property.id,
      autoSeededSpots: seeded || 0,
    });
  } catch (err) {
    console.error('❌ Property creation error:', err.message);
    res.status(500).json({ message: 'Error creating property', error: err.message });
  }
});

// --- POST /api/bookings --- (or PATCH /api/bookings/:id/approve)
// Create a new booking + guest taste intake
// Body: { propertyId, guestName, groupType, tastePreferences {music, food, film}, groupMode }
router.post('/bookings', async (req, res) => {
  try {
    const {
      propertyId,
      guestName,
      groupType,
      tastePreferences,
      groupMode,
    } = req.body;

    if (!propertyId || !guestName) {
      return res.status(400).json({ message: 'propertyId and guestName are required' });
    }

    // Generate a share token (URL-safe, base64-like)
    const shareToken = Buffer.from(`${propertyId}-${Date.now()}-${Math.random()}`)
      .toString('base64')
      .substring(0, 16);

    // Create booking in MongoDB
    const booking = new Booking({
      propertyId,
      guestName,
      groupType: groupType || 'solo',
      tastePreferences: tastePreferences || { music: '', food: '', film: '' },
      groupMode: groupMode || false,
      shareToken,
      approvalStatus: 'pending',
    });

    await booking.save();

    // --- Hydrate the property into Relate if this is the first booking ---
    // On the first booking, ensure the property exists in the Relate single-file store.
    // This is idempotent (MERGE), so running it multiple times is safe.
    try {
      const propResult = await relate.cypher(
        `
        MATCH (p {id: $propId})
        WITH p
        CALL apoc.create.addLabels(p, ['Property']) YIELD node
        RETURN p
        `,
        { propId: propertyId }
      );
    } catch (e) {
      // Relate may need the property explicitly created via a Cypher MERGE
      // We'll do a simple create-if-not-exists:
      try {
        await relate.cypher(
          `
          MERGE (:Property {id: $propId})
          SET { name: "Unnamed Property", neighborhood: "Unknown", wifiPass: "", doorCode: "", houseRules: "" }
          `,
          { propId: propertyId }
        );
      } catch (e2) {
        console.error('⚠️ Relate property hydration error:', e2.message);
      }
    }

    // --- Draft a welcome note based on current (possibly empty) graph ---
    // This is a placeholder; the real guide will be generated after taste intake.
    const { draftWelcomeNote } = require('../utils/llmClient');
    const normalizedTastes = tastePreferences
      ? Object.values(tastePreferences)
          .filter((v) => v && v.trim())
          .join(', ')
      : '';

    const welcomeNote = await draftWelcomeNote({
      propertyName: name || 'Your Property',
      neighborhood: neighborhood || '',
      matchedSpots: [],
      guestTastes: normalizedTastes,
      hostRules: houseRules || '',
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      shareToken,
      welcomeDraft: welcomeNote,
      approvalStatus: 'pending',
    });
  } catch (err) {
    console.error('❌ Booking creation error:', err.message);
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
});

// --- PATCH /api/bookings/:id/approve ---
// Human-in-the-loop: host reviews and approves the guide
router.patch('/bookings/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedVibes, welcomeMessage, matchedSpotIds } = req.body;

    await Booking.findByIdAndUpdate(id, {
      approvalStatus: approvedVibes ? 'approved' : 'rejected',
      welcomeDraft: welcomeMessage || '',
      matchedSpotIds: matchedSpotIds || [],
      approvedAt: new Date(),
    });

    // --- Generate QR code for the guest guide link ---
    const booking = await Booking.findById(id);
    const guideUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/guide/${booking.shareToken}`;

    let qrCodeDataURL = '';
    try {
      qrCodeDataURL = await qrcode.toDataURL(guideUrl);
    } catch (qrErr) {
      console.error('⚠️ QR code generation error:', qrErr.message);
      qrCodeDataURL = null;
    }

    console.log(`✅ Booking ${id} ${approvedVibes ? 'approved' : 'rejected'}`);
    res.json({
      message: `Booking ${approvedVibes ? 'approved' : 'rejected'}`,
      guideUrl,
      qrCode: qrCodeDataURL,
    });
  } catch (err) {
    console.error('❌ Booking approval error:', err.message);
    res.status(500).json({ message: 'Error approving booking', error: err.message });
  }
});

// --- POST /api/concierge/chat ---
// Grounded Q&A over house manual + Relate property subgraph
router.post('/concierge/chat', async (req, res) => {
  try {
    const { question, propertyId = 'prop-1' } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const { getAnswer } = require('../agents/conciergeAgent');
    const answer = await getAnswer(question, propertyId);

    res.json({
      question,
      answer,
    });
  } catch (err) {
    console.error('❌ Concierge chat error:', err.message);
    res.status(500).json({ message: 'Error processing concierge question', error: err.message });
  }
});

module.exports = router;