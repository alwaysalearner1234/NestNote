/**
 * CachedGuide Mongoose Schema
 * 
 * Caches personalized guides keyed by (propertyId + sortedVibesHash).
 * 
 * Rationale: The guideCuratorAgent may take a few hundred ms to traverse
 * the Relate graph + generate an LLM welcome note. Caching ensures
 * subsequent guide requests for the same property + taste combo are <50ms.
 * 
 * Cache TTL: 30 days (after which the guide is evicted and regenerated
 * on the next guest check-in, incorporating any new :LOVED_SPOT ratings).
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CachedGuideSchema = new Schema({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  vibesHash: { type: String, required: true }, // sorted+joined taste tags, e.g., "food-pizza+film-indie_wine"
  guideText: { type: String, required: true }, // AI-drafted welcome note + spot list
  spotIds: { type: [Schema.Types.ObjectId], default: [] }, // LocalSpot IDs included in this guide
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: function () { return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); } }, // 30-day TTL
});

CachedGuideSchema.index({ propertyId: 1, vibesHash: 1 }, { unique: true });
CachedGuideSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CachedGuide', CachedGuideSchema);
module.exports.default = CachedGuideSchema;