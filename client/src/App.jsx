/**
 * App.jsx
 * 
 * Route definitions for Welcome Kit frontend.
 * 
 * Routes (all under the / client root):
 *   /                    — Landing / host onboarding entry
 *   /host/dashboard      — Host dashboard (property setup, booking queue)
 *   /host/review/:bookingId  — Host review & approval modal
 *   /guest/checkin/:bookingId  — Guest 3-question taste intake
 *   /guide/:shareToken   — Personalized guest welcome guide
 *   /demo/compare        — Split-screen judge demo with live graph
 * 
 * Navbar is shared across all routes with a quick switch to Judge Demo Mode.
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// ---- Page Components ----
import HostDashboard from './pages/HostDashboard.jsx';
import GuestTasteIntake from './pages/GuestTasteIntake.jsx';
import GuestWelcomeGuide from './pages/GuestWelcomeGuide.jsx';
import JudgeSplitDemo from './pages/JudgeSplitDemo.jsx';

// ---- Modal/Overlay Components (rendered outside Router) ----
import HostApprovalModal from './components/HostApprovalModal.jsx';
import ConciergeChatDrawer from './components/ConciergeChatDrawer.jsx';
import QuickCopyEssentials from './components/QuickCopyEssentials.jsx';

function App() {
  const location = useLocation();

  // Highlight active nav link based on current path
  const path = location.pathname;

  return (
    <Router>
      <Navbar />

      <main className="min-h-screen bg-bg text-ink p-4 md:p-6">
        <Router>
          <Routes>
            <Route path="/" element={<HostDashboard />} />
            <Route path="/host/dashboard" element={<HostDashboard />} />
            <Route path="/host/review/:bookingId" element={<HostApprovalModal />} />
            <Route path="/guest/checkin/:bookingId" element={<GuestTasteIntake />} />
            <Route path="/guide/:shareToken" element={<GuestWelcomeGuide />} />
            <Route path="/demo/compare" element={<JudgeSplitDemo />} />
            {/* Fallback: 404 within SPA */}
            <Route path="*" element={<div className="text-xl text-error">Page not found</div>} />
          </Routes>
        </Router>
      </main>
    </Router>
  );
}

export default App;