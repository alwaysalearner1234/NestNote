/**
 * GuestWelcomeGuide.jsx
 * 
 * Screen 4: Personalized welcome guide, category filters, thumbs-up/down feedback.
 * 
 * Features:
 * - One-tap copy cards for Wi-Fi Password, Door Code, and Check-Out Time
 * - Horizontal category filter tabs (All, Morning Coffee, Food & Wine, Music & Nightlife, Hidden Gems, Day Itinerary)
 * - Airbnb-style rounded spot cards (16px radius) with walking-time badges
 * - Expandable "Why This Spot? (Graph Trace)" drawer showing exact Relate nodes and edges
 * - Post-stay thumbs-up/down rating buttons
 * - Slide-up AI House Concierge Chat grounded strictly in the house manual and Relate graph
 * - Shareable URL: /guide/:shareToken
 */

import { useEffect, useState, useParams, Link } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux'; // placeholder
import {
  CategoryFilterBar,
  LocalSpotCard,
  GraphTraceDrawer,
  QuickCopyEssentials,
  ConciergeChatDrawer,
  Button,
} from '../components';
import { Coffee, WineGlass, Music, Leaf, Sparkles, Mail } from 'lucide-react';
import { useRelateWasm } from '../hooks/useRelateWasm.jsx';

const GuestWelcomeGuide = () => {
  const { shareToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [guideText, setGuideText] = useState('');
  const [spots, setSpots] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copied, setCopied] = useState({ wifi: false, door: false, checkout: false });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [rating, setRating] = useState(null); // 1-5 or null
  const guideRef = useRef(null);

  // In a real app, we'd fetch the booking/guide data using the shareToken
  // For now, use mock data or simulate API call
  useEffect(() => {
    if (!shareToken) {
      // No share token — show error or redirect
      window.alert('Missing share token. Please access this guide from a booking link.');
      navigate('/host/dashboard');
      return;
    }

    // Simulate fetching guide data from API
    // In production: fetch(`/api/guides/generate?bookingId=...`)
    const loadGuide = async () => {
      // Mock guide data — in production this comes from the API
      const mockSpots = [
        {
          id: 'spot-1',
          name: 'Morning Brew Cafe',
          category: 'Cafe',
          description: 'Artisanal coffee and pastries, local favorite',
          priceTier: '$',
          walkMins: 5,
          vibes: ['cozy', 'coffee'],
          score: 85,
        },
        {
          id: 'spot-2',
          name: 'The Velvet Grill',
          category: 'Restaurant',
          description: 'Farm-to-table American cuisine, romantic ambiance',
          priceTier: '$$',
          walkMins: 12,
          vibes: ['dining', 'natural_wine'],
          score: 92,
        },
        {
          id: 'spot-3',
          name: 'Jazz & Co',
          category: 'Bar',
          description: 'Live jazz nights, natural wine selection',
          priceTier: '$$',
          walkMins: 8,
          vibes: ['jazz', 'nightlife'],
          score: 97,
        },
        {
          id: 'spot-4',
          name: 'Central City Park',
          category: 'Park',
          description: 'Urban park with walking trails and pond',
          priceTier: '$',
          walkMins: 15,
          vibes: ['family_friendly', 'nature'],
          score: 88,
        },
      ];

      // Mock welcome guide text
      const mockGuide = `🏠 Welcome to your stay! We heard you love coffee and jazz!

      We've curated local spots matching your interests for your stay:

      - Morning Brew Cafe: Artisanal coffee and pastries, local favorite (5 min walk)
      - Jazz & Co: Live jazz nights, natural wine selection (8 min walk)
      - The Velvet Grill: Farm-to-table American cuisine, romantic ambiance (12 min walk)
      - Central City Park: Urban park with walking trails and pond (15 min walk)

      📶 Wi-Fi Password: Please check the quick-copy cards below.
      🔓 Door Code: Please check the quick-copy cards below.
      📋 House Rules: Standard Airbnb courtesy rules apply.

      Have a wonderful stay!`;

      setGuideText(mockGuide);
      setSpots(mockSpots);
    };

    loadGuide();
  }, [shareToken]);

  // Handle spot graph trace click
  const handleGraphTrace = useCallback((spotId) => {
    setSelectedSpotId(spotId);
    setDrawerOpen(true);
  }, []);

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    // Update URL query param
    const searchParams = new URLSearchParams(location.search);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    navigate(newUrl, { replace: true });
  };

  // Handle copy to clipboard
  const handleCopy = async (type) => {
    let text;
    if (type === 'wifi') text = 'guest-wifi-123';
    else if (type === 'door') text = '1234';
    else if (type === 'checkout') text = '11:00 AM';

    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle rating submission (post-stay feedback)
  const handleRate = async (spotId, ratingValue) => {
    setRating(ratingValue);
    
    // In production: POST /api/feedback { bookingId, spotId, rating }
    // For now, just show success and update UI
    window.alert(`Thanks for rating ${ratingValue}★! Your feedback helps future guests.`);
    
    // Commit to Relate via FeedbackMemoryAgent
    // const { commitPostStayRating } = require('../agents/feedbackMemoryAgent');
    // await commitPostStayRating({ propertyId, guestId, spotId, rating: ratingValue });
    
    setTimeout(() => setRating(null), 2000);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedSpotId(null);
  };

  // Handle concierge chat toggle
  const handleConciergeToggle = () => {
    setConciergeOpen(!conciergeOpen);
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Header */}
      <header className="border-b border-border mb-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center font-medium">
              G
            </div>
            <span className="text-xl font-bold">Your Guide</span>
          </div>
          <small className="text-gray-500">
            Shareable link: {window.location.href}
          </small>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Quick Copy Essentials */}
        <QuickCopyEssentials
          wifiPass="guest-wifi-123"
          doorCode="1234"
          checkOutTime="11:00 AM"
          onCopy={setCopied}
        />

        {/* Guide Text */}
        <div className="bg-white rounded-card border border-shadow p-6 md:p-8 mb-6 shadow-sm prose">
          {guideText || 'Loading your personalized guide...'}
        </div>

        {/* Spot Cards Section */}
        {spots.length > 0 && (
          <div>
            {/* Category Filter Bar */}
            <CategoryFilterBar
              spots={spots}
              onSpotSelect={() => {}}
            />

            {/* Filtered spots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spots
                .filter((spot) => {
                  if (categoryFilter === 'all') return true;
                  
                  const categoryMaps = {
                    coffee: ['cozy', 'coffee'],
                    'food-wine': ['dining', 'natural_wine', 'culinary'],
                    'music-nightlife': ['jazz', 'live_music', 'indie'],
                    hidden: ['hidden', 'gem', 'secret'],
                    day: ['nature', 'family_friendly', 'relax'],
                  };
                  
                  const allowedVibes = categoryMaps[categoryFilter] || [];
                  if (!allowedVibes.length) return true;
                  
                  return spot.vibes.some((v) => allowedVibes.includes(v));
                })
                .map((spot) => (
                  <LocalSpotCard
                    key={spot.id}
                    spot={spot}
                    onGraphTrace={() => handleGraphTrace(spot.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Graph Trace Drawer */}
        <GraphTraceDrawer
          isOpen={drawerOpen}
          setIsOpen={handleDrawerClose}
          spotId={selectedSpotId}
          traceData={selectedSpotId ? { nodes: [], edges: [] } : null}
        />

        {/* Post-Stay Feedback Section */}
        {guideText && (
          <div className="bg-white rounded-card border border-shadow p-6 md:p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-medium mb-4">Was This Guide Helpful?</h2>
            
            <p className="text-gray-500 mb-4">
              Your feedback helps future guests get better recommendations and helps us
              improve the guide for everyone.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Button
                  key={i}
                  size="icon"
                  variant="ghost"
                  className`
                    rounded-full bg-${i <= 3 ? 'red-100' : 'green-100'} text-${i <= 3 ? 'red-600' : 'green-600'} hover:bg-${i <= 3 ? 'red-200' : 'green-200'} transition-colors ${rating === i ? 'scale-105' : ''} focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2`
                  onClick={() => handleRate(spot?.[0]?.id || 'spot-1', i)}
                  aria-label={`Rate ${i} stars`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3 9h2l4-8 5.5-3.5l5.3 3.7L22 8.25l-5.6 3.45l-2.15 8.15L12 2z" />
                  </svg>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Concierge Chat Drawer */}
        <ConciergeChatDrawer
          propertyId="prop-1"
          onClose={handleConciergeToggle}
          open={conciergeOpen}
        />

        {/* Bottom concierge button (mobile) */}
        <Button
          onClick={handleConciergeToggle}
          className="mb-4 justify-self-end"
          aria-label="Open concierge chat"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M3 4h18" />
            <path d="M3 12a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1h-8a1 1 0 01-1-1v-4z" />
            <path d="M11 17H7a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4z" />
          </svg>
          Ask Concierge
        </Button>
      </main>
    </div>
  );
};

export default GuestWelcomeGuide;