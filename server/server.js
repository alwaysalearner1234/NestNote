/**
 * Welcome Kit Server — Express + Relate by Neo4j
 * 
 * Features:
 * - Embedded Relate single-file mode (./server/data/welcome-kit.rl)
 * - MongoDB Atlas hydration on startup (MERGE)
 * - CORS, helmet, body parsing
 * - Route mounting for host & guest APIs
 * - Cold-start re-hydration for Render free-tier restarts
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const propertyModel = require('./models/Property').default;
const bookingModel = require('./models/Booking').default;

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- MongoDB Atlas Connection ---
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: 'welcomekit',
  })
  .then(() => {
    console.log('📡 MongoDB Atlas connected');

    // --- Startup Hydration: MERGE new MongoDB entries into Relate single-file ---
    // On Render free-tier restarts, re-hydrate properties & post-stay ratings
    // so the Relate graph stays fresh without manual intervention.
    const { hydrateRelate } = require('./utils/hydrateRelate');
    hydrateRelate()
      .then((count) => {
        console.log(`🔄 Hydrated ${count} entries into Relate single-file store`);
      })
      .catch((err) => {
        console.error('⚠️ Hydration error (non-fatal):', err.message);
      });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// --- Relate Singleton (in-process, single-file mode) ---
// No Neo4j URI/username/password needed. Relate opens ./data/welcome-kit.rl directly.
const { Relate } = require('@relate/relate');
const relate = new Relate('./server/data/welcome-kit.rl');
app.set('relate', relate);

// --- API Routes ---
const hostRoutes = require('./routes/hostRoutes');
const guestRoutes = require('./routes/guestRoutes');

app.use('/api', hostRoutes);
app.use('/api', guestRoutes);

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({
    name: 'Welcome Kit API',
    version: '1.0.0',
    status: 'online',
    graphNodes: relate ? relate.getNodeCount ? relate.getNodeCount() : 'unknown' : 0,
  });
});

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('⚠️ Server error:', err.message, err.stack);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

app.listen(PORT, () => {
  console.log(`🚀 Welcome Kit server running on http://localhost:${PORT}`);
});

module.exports = app;