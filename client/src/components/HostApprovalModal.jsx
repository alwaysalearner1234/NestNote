/**
 * HostApprovalModal.jsx
 * 
 * Human-in-the-loop review showing the guest's 3 taste pills, editable AI-drafted
 * welcome message, matched spots preview, and one-click Approve & Generate Link / QR Code.
 * Member 1 component — renders as a modal overlay on top of the host dashboard.
 * 
 * State flow:
 * 1. Host opens modal via booking ID
 * 2. Guest's 3 taste pills displayed (from booking.tastePreferences)
 * 3. AI-drafted welcome message shown (from booking.welcomeDraft or LLM generation)
 * 4. Matched spots preview from the Relate graph
 * 5. Host can edit the welcome message
 * 6. One-click "Approve & Generate Link / QR Code" 
 *    → PATCH /api/bookings/:id/approve
 */

import { useState, useEffect, useParams } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Loader3, XCircle } from 'lucide-react';
import { useDispatch } from 'react-redux'; // placeholder — would integrate with actual state mgmt
import { Button } from './Button.jsx';

const HostApprovalModal = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(null); // true = approved, false = rejected, null = still open
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [tastePills, setTastePills] = useState(['', '', '']);
  const [matchedSpots, setMatchedSpots] = useState([]);
  [

] = React.useState(0);

  // Fetch booking data when modal opens
  useEffect(() => {
    if (!bookingId) return;

    // In a real app, this would fetch from the API
    // For now, set some placeholder state
    setWelcomeMessage('Welcome to our home! We curated these spots based on your tastes...');
  }, [bookingId]);

  const handleApprove = async () => {
    setLoading(true);

    try {
      // Call the API to approve the booking
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedVibes: tastePills,
          welcomeMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setApproved(true);
        // Generate QR code — the API handles this
        window.alert(`Booking approved! Guide link: ${data.guideUrl}`);
        navigate(`/guide/${data.booking.shareToken}`);
      } else {
        window.alert(`Error: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Approval error:', err);
      window.alert('Failed to approve booking');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setApproved(false);
    // In a real app, we'd close the modal and maybe show feedback
    window.alert('Booking rejected. Guest will be notified.');
    // navigate('/host/dashboard');
    setLoading(false);
  };

  // If bookingId isn't available yet, show a placeholder
  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-card border border-shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Review Booking</h2>
          <p className="text-gray-600 mb-6">
            Select a booking from the dashboard to review and approve.
          </p>
          <button
            onClick={() => navigate('/host/dashboard')}
            className="bg-coral text-white px-4 py-2 rounded-md hover:bg-coralLight transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className`
        fixed inset-0 bg-black/70 backdrop-blur-sm z-50
        min-h-screen flex items-center justify-center p-4
      `
    >
      <div
        className`
          bg-white rounded-card border border-shadow w-full max-w-2xl m-4
          shadow-2xl overflow-hidden
          max-height: 90vh;
        `
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-medium text-xl">Review & Approve Booking</h2>
          <button
            onClick={() => setApproved(null)}
            className="text-gray-400 hover:text-ink transition-colors"
            aria-label="Close modal"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Taste pills section */}
        <div className="p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Guest Taste Preferences</h3>
          <div className="flex gap-2">
            {['Music', 'Food', 'Film'].map((category, i) => {
              const pill = tastePills[i] || '—';
              return (
                <div
                  key={category}
                  className`
                    flex-1 rounded-full bg-gray-light p-2 text-xs
                    ${copied ? 'bg-coral text-white' : ''}
                  `
                >
                  {pill}
                </div>
              );
            })}
          </div>
        </div>

        {/* Welcome message editor */}
        <div className="p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">AI-Drafted Welcome Message</h3>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            className`
              w-full rounded-md border border-border p-2 text-sm focus:outline-none 
              focus:ring-2 focus:ring-coral focus:ring-offset-2 resize-y
            `
            placeholder="Welcome to your stay... (editable by host)"
          ></textarea>
        </div>

        {/* Matched spots preview */}
        <div className="p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Matched Spots Preview</h3>
          {matchedSpots.length > 0 ? (
            <ul className="text-sm space-y-1">
              {matchedSpots.map((spot, i) => (
                <li key={i}>
                  <span className="font-medium">{spot.name}</span>
                  <span className="text-gray-500"> ({spot.walkMins} min walk)</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No spots matched yet. The guide will be generated after taste intake.</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={() => setApproved(false)}
            disabled={loading}
            className`
              flex-1 rounded-md border border-border px-4 py-2 text-sm text-ink
              hover:bg-gray-light transition-colors
              ${loading ? 'opacity: 0.5' : ''}
            `
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className`
              flex-1 rounded-md bg-coral px-4 py-2 text-sm font-medium text-white
              hover:bg-coralLight transition-colors
              ${loading ? 'opacity: 0.5' : ''}
            `
          >
            {loading ? 'Approving...' : 'Approve & Generate Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostApprovalModal;