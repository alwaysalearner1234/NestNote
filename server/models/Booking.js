/**
 * Booking Mongoose Schema
 * 
 * Represents a guest booking + taste intake + approval flow.
 * 
 * Fields:
 * - propertyId: links to the host property
 * - guestName / guestEmail: contact info (no mandatory login)
 * - shareToken: URL-safe token for the personalized guide link
 * - tastePreferences: normalized from the 3-question intake (Music, Food, Film)
 * - groupType: solo, couple, family
 * - approvalStatus: pending, approved, rejected
 * - welcomeDraft: AI-drafted welcome message (editable by host)
 * - postStayFeedback: optional rating after checkout
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String }, // optional, no login required
  groupType: { type: String, enum: ['solo', 'couple', 'family', 'group'], default: 'solo' },
  // 3 taste pills from check-in
  tastePreferences: {
    music: { type: String, default: '' },     // e.g., "jazz", "indie", "classical"
    food: { type: String, default: '' },      // e.g., "natural_wine", "pizza", "street_food"
    film: { type: String, default: '' },      // e.g., "indie_film", "documentary"
  },
  groupMode: { type: Boolean, default: false }, // blend tastes for couples/families
  shareToken: { type: String, required: true, unique: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  welcomeDraft: { type: String, default: '' }, // AI-narrated from Relate subgraph
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
});

module.exports = mongoose.model('Booking', BookingSchema);
module.exports.default = BookingSchema;