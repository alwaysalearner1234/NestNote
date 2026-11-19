/**
 * GuestTasteIntake.jsx
 * 
 * Screen 3: 3-question check-in (Music, Food, Film + Group Mode toggle).
 * Frictionless 30-second mobile check-in — no guest login required.
 * Member 2 component.
 * 
 * Features:
 * - Three taste pillars: Music, Food, Film/Vibe
 * - Each pillar has preset tags + free-text option
 * - Group Mode toggle: blend tastes for couples or families
 * - Progress indicator
 * - Generate link button that creates a booking and redirects to the guide
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { useRef } from 'react';
import { Zap, Music, WineGlass, Film, Home, Users, Layout } from 'lucide-react';

const TasteOptions = {
  music: [
    { label: 'Jazz', value: 'jazz' },
    { label: 'Classical', value: 'classical' },
    { label: 'Indie', value: 'indie' },
    { label: 'Pop', value: 'pop' },
    { label: 'Hip-Hop', value: 'hip-hop' },
    { label: 'Other', value: 'other_music' },
  ],
  food: [
    { label: 'Pizza', value: 'pizza' },
    { label: 'Natural Wine', value: 'natural_wine' },
    { label: 'Street Food', value: 'street_food' },
    { label: 'Fine Dining', value: 'fine_dining' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Other', value: 'other_food' },
  ],
  film: [
    { label: 'Indie Film', value: 'indie_film' },
    { label: 'Documentary', value: 'documentary' },
    { label: 'Classic Cinema', value: 'classic_cinema' },
    { label: 'Comedy', value: 'comedy' },
    { label: 'Other', value: 'other_film' },
  ],
};

const GuestTasteIntake = () => {
  const [step, setStep] = useState(1); // 1 = taste intake, 2 = group mode, 3 = done
  const [tastes, setTastes] = useState({
    music: '',
    food: '',
    film: '',
  });
  const [groupMode, setGroupMode] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({ music: [], food: [], film: [] });
  const navigate = useNavigate();
  const params = useParams();
  const bookingId = params.bookingId;

  // Generate share token and create booking
  const generateGuide = () => {
    const { music, food, film } = tastes;
    
    if (!music || !food || !film) {
      window.alert('Please select a taste for each category before continuing.');
      return;
    }

    // Create booking via API
    const shareToken = Buffer.from(`prop-${Math.random()}-${Date.now()}`)
      .toString('base64')
      .substring(0, 16);

    const newBooking = {
      propertyId: params.propertyId || 'prop-1',
      guestName: 'Guest', // No login required
      groupType: groupMode ? 'group' : 'solo',
      tastePreferences: { music, food, film },
      groupMode,
      shareToken,
      approvalStatus: 'pending',
    };

    // Save booking (in production, this would be a POST /api/bookings)
    // For now, store in localStorage and redirect
    localStorage.setItem('welcome_booking', JSON.stringify(newBooking));

    // Redirect to the personalized guide
    navigate(`/guide/${shareToken}`);
  };

  return (
    <div className="min-h-screen bg-bg text-ink p-4 md:p-8">
      {/* Header with progress */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to Welcome Kit!
        </h1>
        <p className="text-gray-500 mt-1">
          Answer 3 quick questions so we can curate a personalized local guide just for you.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 rounded-md bg-gray-light p-2 mb-4">
        <div
          className`
            flex-1 rounded-basis bg-coral text-white text-xs ${step === 1 ? '' : 'opacity-50'}
          `
        >
          1
        </div>
        <span className="text-xs text-gray-400 capitalize">tastes</span>
        <div
          className`
            flex-1 rounded-basis ${step === 2 ? 'bg-coral text-white' : 'opacity-50'} text-xs
          `
        >
          2
        </div>
        <span className="text-xs text-gray-400 capitalize">group</span>
        <div
          className`
            flex-1 rounded-basis ${step === 3 ? 'bg-coral text-white' : 'opacity-50'} text-xs
          `
        >
          3
        </div>
        <span className="text-xs text-gray-400 capitalize">guide</span>
      </div>

      {/* Step 1: 3-Question Taste Intake */}
      {step === 1 && (
        <div className="prose max-w-3xl">
          <h2 className="text-xl font-medium mb-6">Tell Us Your Tastes</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Music */}
            <div>
              <label className="block text-sm font-medium mb-2">Music</label>
              <div className="space-y-1">
                {TasteOptions.music.map((option) => (
                  <label
                    key={option.value}
                    className`
                      inline-flex items-center gap-2 rounded-border border px-3 py-1.5 text-sm
                        cursor-pointer ${selectedOptions.music.includes(option.value) ? 'bg-coral text-white' : 'text-ink hover:bg-gray-light'}
                    `
                    onClick={() => {
                      if (selectedOptions.music.includes(option.value)) {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          music: prev.music.filter((v) => v !== option.value),
                        }));
                      } else {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          music: [...prev.music, option.value],
                        }));
                      }
                    }}
                  >
                    <span className="flex-1">{option.label}</span>
                    {selectedOptions.music.includes(option.value) && (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="white"
                        stroke="none"
                      >
                        <path d="M5 15l14 0" />
                      </svg>
                    )}
                  </label>
                ))}
                <Input
                  type="text"
                  placeholder="e.g., Jazz, Classical, Indie..."
                  value={tastes.music}
                  onChange={(e) => setTastes((prev) => ({ ...prev, music: e.target.value }))}
                  disabled={selectedOptions.music.length > 0 ? 'disabled' : ''}
                  className="mt-2 block w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                />
              </div>
            </div>

            {/* Food */}
            <div>
              <label className="block text-sm font-medium mb-2">Food</label>
              <div className="space-y-1">
                {TasteOptions.food.map((option) => (
                  <label
                    key={option.value}
                    className`
                      inline-flex items-center gap-2 rounded-border border px-3 py-1.5 text-sm
                        cursor-pointer ${selectedOptions.food.includes(option.value) ? 'bg-coral text-white' : 'text-ink hover:bg-gray-light'}
                    `
                    onClick={() => {
                      if (selectedOptions.food.includes(option.value)) {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          food: prev.food.filter((v) => v !== option.value),
                        }));
                      } else {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          food: [...prev.food, option.value],
                        }));
                      }
                    }}
                  >
                    <span className="flex-1">{option.label}</span>
                    {selectedOptions.food.includes(option.value) && (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="white"
                        stroke="none"
                      >
                        <path d="M5 15l14 0" />
                      </svg>
                    )}
                  </label>
                ))}
                <Input
                  type="text"
                  placeholder="e.g., Pizza, Natural Wine, Street Food..."
                  value={tastes.food}
                  onChange={(e) => setTastes((prev) => ({ ...prev, food: e.target.value }))}
                  disabled={selectedOptions.food.length > 0 ? 'disabled' : ''}
                  className="mt-2 block w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                />
              </div>
            </div>

            {/* Film / Vibe */}
            <div>
              <label className="block text-sm font-medium mb-2">Film / Vibe</label>
              <div className="space-y-1">
                {TasteOptions.film.map((option) => (
                  <label
                    key={option.value}
                    className`
                      inline-flex items-center gap-2 rounded-border border px-3 py-1.5 text-sm
                        cursor-pointer ${selectedOptions.film.includes(option.value) ? 'bg-coral text-white' : 'text-ink hover:bg-gray-light'}
                    `
                    onClick={() => {
                      if (selectedOptions.film.includes(option.value)) {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          film: prev.film.filter((v) => v !== option.value),
                        }));
                      } else {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          film: [...prev.film, option.value],
                        }));
                      }
                    }}
                  >
                    <span className="flex-1">{option.label}</span>
                    {selectedOptions.film.includes(option.value) && (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="white"
                        stroke="none"
                      >
                        <path d="M5 15l14 0" />
                      </svg>
                    )}
                  </label>
                ))}
                <Input
                  type="text"
                  placeholder="e.g., Indie Film, Documentary, Classic Cinema..."
                  value={tastes.film}
                  onChange={(e) => setTastes((prev) => ({ ...prev, film: e.target.value }))}
                  disabled={selectedOptions.film.length > 0 ? 'disabled' : ''}
                  className="mt-2 block w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          {/* Group Mode toggle */}
          <div className="mt-6 p-4 bg-gray-light rounded-card border border-shadow">
            <h3 className="font-medium mb-3">Group Mode</h3>
            <p className="text-gray-500 mb-2">
              Blending tastes for couples or families. Enable if you're traveling with
              others and want a guide that suits the whole group.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={groupMode}
                onChange={(e) => setGroupMode(e.target.checked)}
                className="rounded border-gray-300 focus:ring-coral focus:ring-offset-2"
              />
              <span className="text-sm">
                {groupMode ? 'Enable Group Mode' : 'Disable Group Mode'}
              </span>
            </label>
          </div>

          <Button
            kind="primary"
            fullWidth
            onClick={() => setStep(2)}
            disabled= {Object.values(tastes).every((v) => !v)}
          >
            Continue to Group Mode{' '}
            {Object.values(tastes).every((v) => v) && ' →'}
          </Button>
        </div>
      )}

      {/* Step 2: Group Mode / Confirmation */}
      {step === 2 && (
        <div className="prose max-w-3xl">
          <h2 className="text-xl font-medium mb-6">
            {groupMode ? 'Group Mode Enabled' : 'Your Tastes'}
          </h2>

          <p className="text-gray-600 mb-4">
            Based on your selections, we'll generate a personalized guide that balances
            everyone's preferences. The guide will be ready before you arrive.
          </p>

          {/* Display selected taste pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedOptions.music.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-coral/20 text-coral text-xs px-2 py-1">
                {tag}
              </span>
            ))}
            {selectedOptions.food.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-amber/20 text-amber text-xs px-2 py-1">
                {tag}
              </span>
            ))}
            {selectedOptions.film.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-green-100 text-green-800 text-xs px-2 py-1">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {groupMode && (
              'Your guide will blend jazz, food, and film vibes to create a balanced '
              'itinerary that works for the whole group. '
            )}
            {'}We heard you love {selectedOptions.music.join(', ') || '—'}, '
            + `${selectedOptions.food.join(', ') || '—'}, and `
            + `${selectedOptions.film.join(', ') || '—'}.`}
          </p>

          <Button
            kind="primary"
            fullWidth
            onClick={() => generateGuide()}
          >
            Generate My Personalized Guide
          </Button>
        </div>
      )}

      {/* Step 3: Done / Loading */}
      {step === 3 && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-coral opacity-80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <h2 className="text-2xl font-bold mb-3">Your Guide Is Generating...</h2>
            <p className="text-gray-500">
              We're curating your personalized local itinerary based on your tastes. This
              may take a moment while our graph database traverses real relationships
              between venues, vibe tags, and past guest endorsements.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Once ready, you'll be taken to your personalized welcome guide with Wi-Fi,
              door code, and curated spot recommendations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestTasteIntake;