/**
 * Feedback Mongoose Schema
 * 
 * Post-stay spot ratings committed to Relate via the FeedbackMemoryAgent.
 * 
 * On Render free-tier restarts, `hydrateRelate.js` MERGs new feedback entries
 * into the Relate single-file store so the graph evolves with real guest endorsements.
 * 
 * Fields:
 * - propertyId: which property this feedback belongs to
 * - spotId: which local spot was rated
 * - guestId: unique guest identifier (generated at check-in, no login required)
 * - rating: 1-5 thumbs scale
 * - note: optional free-text note from the guest
 * - createdAt: timestamp
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  spotId: { type: String, required: true }, // Relate LocalSpot ID (string, not ObjectId)
  guestId: { type: String, required: true }, // unique per check-in session
  rating: { type: Number, min: 1, max: 5, required: true }, // 1 = thumbs-down, 5 = thumbs-up
  note: { type: String }, // free-text guest note
  createdAt: { type: Date, default: Date.now },
});

// Index for fast property + spot lookups during hydration
FeedbackSchema.index({ propertyId: 1, spotId: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
module.exports.default = FeedbackSchema;