/**
 * hostRoutes.js
 * 
 * Isolated host routes — prevents merge conflicts with Member 2's guest routes.
 * 
 * Routes:
 *   POST /api/properties             — Host one-time property setup
 *   POST /api/bookings               — Create booking + guest taste intake
 *   PATCH /api/bookings/:id/approve  — Host approves/rejects guide + QR generation
 *   POST /api/concierge/chat         — Grounded Q&A over house manual + Relate graph
 */

const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');

router.post('/properties', hostController.properties);
router.post('/bookings', hostController.bookings);
router.patch('/bookings/:id/approve', hostController.approve);
router.post('/concierge/chat', hostController.conciergeChat);

module.exports = router;