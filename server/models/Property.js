/**
 * Property Mongoose Schema
 * 
 * Host-defined property metadata stored in MongoDB Atlas.
 * On Render restart, `hydrateRelate.js` MERGs these entries into
 * the Relate single-file store so the graph stays consistent.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PropertySchema = new Schema({
  hostId: { type: String, required: true },     // MongoDB user ID or clerk ID
  name: { type: String, required: true },       // e.g., "Cozy Downtown Loft"
  neighborhood: { type: String, required: true }, // e.g., "West Village"
  address: { type: String },                     // Full host address (used by OSM discovery)
  wifiPass: { type: String },                   // Wi-Fi password (displayed in guide only)
  doorCode: { type: String },                   // Door code (displayed in guide only)
  houseRules: { type: String },                 // Text block shown in welcome guide
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for fast neighborhood lookups
PropertySchema.index({ neighborhood: 1 });

module.exports = mongoose.model('Property', PropertySchema);
module.exports.default = PropertySchema;