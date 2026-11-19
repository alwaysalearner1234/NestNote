/**
 * CategoryFilterBar.jsx
 * 
 * Horizontal icon filter tabs (All, Coffee, Food & Wine, Music, Hidden Gems).
 * Member 2 component — appears at the top of GuestWelcomeGuide.
 * 
 * Filters the displayed LocalSpot cards by vibe/category.
 * Selected state updates the URL query param for shareability.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Coffee, WineGlass, Music, Leaf, Sparkles } from 'lucide-react';

const CategoryFilterBar = ({
  spots, // Array of { id, name, category, vibes, walkMins }
  onSpotSelect, // (spotId) => void
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState('all');

  // Extract categories from spots
  const allCategories = [
    { key: 'all', label: 'All', icon: Globe },
    { key: 'coffee', label: 'Morning Coffee', icon: Coffee },
    { key: 'food', label: 'Food & Wine', icon: WineGlass },
    { key: 'music', label: 'Music & Nightlife', icon: Music },
    { key: 'hidden', label: 'Hidden Gems', icon: Sparkles },
    { key: 'day', label: 'Day Itinerary', icon: Leaf },
  ];

  // Update active category on hash/link change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paramCategory = searchParams.get('category');
    if (paramCategory && allCategories.some((c) => c.key === paramCategory)) {
      setActiveCategory(paramCategory);
    }
  }, [location.search]);

  // Update URL when category changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (activeCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', activeCategory);
    }
    // Don't navigate on every state change — just update the URL
    // navigator.push({ search: searchParams.toString() }); // would cause re-render
  }, [activeCategory, location]);

  const filteredSpots = spots.filter(
    (spot) =>
      activeCategory === 'all' ||
      (activeCategory === 'coffee' &&
        (spot.vibes && spot.vibes.includes('coffee'))) ||
      (activeCategory === 'food' &&
        (spot.vibes && spot.vibes.some((v) => v.includes('wine') || v.includes('food')))) ||
      (activeCategory === 'music' &&
        (spot.vibes && spot.vibes.includes('music'))) ||
      (activeCategory === 'hidden' &&
        (spot.vibes && spot.vibes.some((v) => v.includes('hidden') || v.includes('gem')))) ||
      (activeCategory === 'day')
  );

  return (
    <div className="bg-white rounded-card border border-shadow mb-6 shadow-sm">
      <div className="flex gap-1 px-2 pb-1">
        {allCategories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className`
              flex-1 rounded-md border border-${activeCategory === cat.key ? 'coral' : 'transparent'} 
              text-sm font-medium transition-colors hover:bg-gray-light focus:outline-none 
              focus:ring-2 focus:ring-coral focus:ring-offset-2 ${activeCategory === cat.key ? 'text-coral' : 'text-ink'}
            `
            onClick={() => {
              setActiveCategory(cat.key);
              // Update URL via pushState without full page nav
              const searchParams = new URLSearchParams(location.search);
              if (cat.key === 'all') {
                searchParams.delete('category');
              } else {
                searchParams.set('category', cat.key);
              }
              const newUrl = `${location.pathname}?${searchParams.toString()}`;
              navigate(newUrl, { replace: true });
            }}
            aria-pressed={activeCategory === cat.key}
            title={cat.label}
          >
            <Icon className="h-4 w-4 mr-1.5" />
            <span className="hidden md:inline">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterBar;