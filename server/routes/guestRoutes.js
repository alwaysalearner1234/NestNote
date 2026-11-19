/**
 * guestRoutes.js
 * 
 * Isolated guest routes — prevents merge conflicts with Member 1's host routes.
 * 
 * Routes:
 *   POST /api/guides/generate  — Personalized welcome guide generation
 *   POST /api/feedback         — Post-stay thumbs-up/down rating
 *   GET /api/demo/compare      — Split-screen judge demo with live graph paths
 */

const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

router.post('/guides/generate', guestController.generateGuide);
router.post('/feedback', guestController.submitFeedback);
router.get('/demo/compare', guestController.compareGuides);

module.exports = router;