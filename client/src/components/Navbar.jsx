/**
 * Navbar.jsx
 * 
 * Clean Airbnb-style top bar with quick switch to Judge Demo Mode.
 * Shared across all routes (Member 1: 4 frontend files, Member 2: 7 frontend files).
 * 
 * Features:
 * - Brand logo/title
 * - Quick toggle to Judge Demo Mode (Member 2's screen)
 * - Logout (placeholder)
 */

import { Link } from 'react-router-dom';
import { Menu, Settings, Search, Zap } from 'lucide-react';

const Navbar = () => {
  const [demoMode, setDemoMode] = React.useState(false);

  const handleDemoToggle = () => {
    setDemoMode(true);
    // In a real deployment, this could redirect or show a modal
    window.alert('Judge Demo Mode — comparing two guest guides side-by-side!');
  };

  return (
    <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center font-medium">
              W
            </div>
            <span className="text-xl font-bold">Welcome Kit</span>
          </Link>
          <span className="text-sm text-gray-500">Personalized Local Guide</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Host quick actions (visible when onboarding or dashboard) */}
          {window.location.pathname.includes('/host') && (
            <Link to="/host/dashboard" className="text-sm text-ink hover:text-coral transition-colors">
              Dashboard
            </Link>
          )}

          {/* Judge Demo Mode toggle — Member 2 feature */}
          <button
            onClick={handleDemoToggle}
            className="relative flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
            aria-pressed={demoMode}
            aria-label="Toggle Judge Demo Mode"
          >
            <Zap className="h-4 w-4" />
            <span>Judge Demo</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;