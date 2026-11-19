/**
 * guestController.js
 * 
 * Logic for taste intake, guide generation, feedback & split-screen compare.
 * 
 * Member 2 responsibilities (50/50 work division):
 * - Guest 3-question taste intake flow
 * - Personalized guide generation via guideCuratorAgent
 * - Post-stay feedback submission
 * - Split-screen judge demo (/api/demo/compare)
 */

const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { curateGuidedItinerary, draftWelcomeGuide, cacheGuide, generateCacheKey } = require('../agents/guideCuratorAgent');
const { Feedback } = require('../models');

// --- POST /api/guides/generate ---
// Generate personalized welcome guide after guest taste intake
router.post('/guides/generate', async (req, res) => {
  try {
    const { bookingId, tastePreferences } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    // Fetch the booking to get propertyId and guest info
    const booking = await Booking.findById(bookingId).populate('propertyId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const propertyId = booking.propertyId ? booking.propertyId.id || booking.propertyId : 'prop-1';
    const tastePrefs = tastePreferences || booking.tastePreferences || { music: '', food: '', film: '' };

    // --- Step 1: Curate the guided itinerary via multi-hop Cypher traversal ---
    const { spots, message } = await curateGuidedItinerary(
      propertyId,
      tastePrefs,
      booking.groupMode || false,
    );

    if (spots.length === 0) {
      // If no spots matched, return a friendly message but still generate a guide
      return res.json({
        bookingId: booking.id,
        shareToken: booking.shareToken,
        spots: [],
        guideText: `Welcome to your stay! ${message} No spots matched your current taste profile, but the neighborhood has plenty to explore. Feel free to ask your host for recommendations.`,
        groupMode: booking.groupMode || false,
      });
    }

    // --- Step 2: Draft the welcome guide (LLM or offline template) ---
    const propertyName = booking.propertyId.name || 'Your Property';
    const neighborhood = booking.propertyId.neighborhood || 'the neighborhood';

    const guideText = await draftWelcomeGuide({
      propertyName,
      neighborhood,
      spots,
      guestTastes: tastePreferences ? `${tastePreferences.music}, ${tastePreferences.food}, ${tastePreferences.film}` : '',
      hostRules: booking.propertyId.houseRules || '',
    });

    // --- Step 3: Cache the guide in MongoDB for <50ms repeat reads ---
    const spotIds = spots.map((s) => s.id);
    const cacheKey = generateCacheKey(propertyId, tastePrefs, booking.groupMode || false);

    await cacheGuide(
      propertyId,
      tastePrefs,
      guideText,
      spotIds,
    );

    res.json({
      bookingId: booking.id,
      shareToken: booking.shareToken,
      spots,
      guideText,
      groupMode: booking.groupMode || false,
      cached: true,
    });
  } catch (err) {
    console.error('❌ Guide generation error:', err.message);
    res.status(500).json({ message: 'Error generating guide', error: err.message });
  }
});

// --- POST /api/feedback ---
// Post-stay thumbs-up/down rating + note for a spot
router.post('/feedback', async (req, res) => {
  try {
    const { bookingId, spotId, rating, note } = req.body;

    if (!bookingId || !spotId || !rating) {
      return res.status(400).json({ message: 'bookingId, spotId, and rating are required' });
    }

    // Rating must be 1-5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Fetch the booking to get propertyId
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const propertyId = booking.propertyId ? (booking.propertyId.id || booking.propertyId) : 'prop-1';
    const guestId = `guest-${Date.now()}`; // unique per check-in session

    // --- Commit the rating to Relate via the FeedbackMemoryAgent ---
    const { commitPostStayRating } = require('../agents/feedbackMemoryAgent');
    const result = await commitPostStayRating({
      propertyId,
      guestId,
      spotId,
      rating,
      note: note || '',
    });

    if (!result.success) {
      return res.status(500).json({ message: 'Error committing feedback', error: result.error });
    }

    // --- Also save to MongoDB Atlas for persistence & restart hydration ---
    const newFeedback = new Feedback({
      propertyId: typeof booking.propertyId === 'object' ? booking.propertyId._id : booking.propertyId,
      spotId,
      guestId,
      rating,
      note,
    });

    await newFeedback.save();

    // --- Optionally re-hydrate the Relate graph so the guide can evolve ---
    // In a full system, this would trigger a guide re-generation.
    // For the hackathon, we just log it.
    console.log(`📝 Post-stay feedback saved: ${rating}★ for ${spotId}`);

    res.json({
      message: 'Feedback submitted successfully',
      rating,
      spotId,
    });
  } catch (err) {
    console.error('❌ Feedback error:', err.message);
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
});

// --- GET /api/demo/compare ---
// Split-screen judge demo: same property, different guests -> completely different guides
router.get('/demo/compare', async (req, res) => {
  try {
    const { propertyId } = req.query;

    if (!propertyId) {
      return res.status(400).json({ message: 'propertyId query param is required' });
    }

    // Define two completely different guest taste profiles for the demo
    // Guest A: Jazz & Indie Film Lover
    // Guest B: Family with Kids
    const guestATastes = { music: 'jazz', food: 'natural_wine', film: 'indie_film' };
    const guestBTastes = { music: 'classical', food: 'pizza', film: 'documentary' };

    // --- Curate guides for both guests ---
    const propId = propertyId;
    const [resultA, resultB] = await Promise.all([
      curateGuidedItinerary(propId, guestATastes, false),
      curateGuidedItinerary(propId, guestBTastes, false),
    ]);

    // Draft welcome guides for both
    const propertyName = (await Property.findById(propId))?.name || 'Your Property';
    const neighborhood = (await Property.findById(propId))?.neighborhood || 'the neighborhood';

    const [guideA, guideB] = await Promise.all([
      draftWelcomeGuide({
        propertyName,
        neighborhood,
        spots: resultA.spots,
        guestTastes: 'jazz, natural_wine, indie_film',
        hostRules: 'Standard Airbnb courtesy rules.',
      }),
      draftWelcomeGuide({
        propertyName,
        neighborhood,
        spots: resultB.spots,
        guestTastes: 'classical, pizza, documentary',
        hostRules: 'Standard Airbnb courtesy rules.',
      }),
    ]);

    // --- Return both guides side-by-side for the judge demo ---
    res.json({
      propertyId,
      propertyName,
      neighborhood,
      // Guest A: Jazz & Indie Film Lover
      guestA: {
        name: 'Jazz & Indie Film Lover',
        tastes: 'Jazz music, natural wine, indie film',
        spots: resultA.spots,
        guide: guideA,
      },
      // Guest B: Family with Kids
      guestB: {
        name: 'Family with Kids',
        tastes: 'Classical music, pizza, documentary',
        spots: resultB.spots,
        guide: guideB,
      },
      // Live subgraph info for the browser graph explorer
      subgraphTraces: {
        guestA: {
          musicVibe: resultA.spots.some((s) => s.vibes && s.vibes.includes('jazz')) ? 'present' : 'absent',
          filmVibe: resultA.spots.some((s) => s.vibes && s.vibes.includes('indie_film')) ? 'present' : 'absent',
        },
        guestB: {
          familyVibe: resultB.spots.some((s) => s.vibes && s.vibes.includes('family_friendly')) ? 'present' : 'absent',
          pizzaVibe: resultB.spots.some((s) => s.vibes && s.vibes.includes('pizza')) ? 'present' : 'absent',
        },
      },
    });
  } catch (err) {
    console.error('❌ Demo compare error:', err.message);
    res.status(500).json({ message: 'Error generating split-screen comparison', error: err.message });
  }
});

module.exports = router;