/**
 * QuickCopyEssentials.jsx
 * 
 * One-tap copy cards for Wi-Fi Password, Door Code & Check-Out Time.
 * Member 1 component — appears in GuestWelcomeGuide.
 * 
 * Features:
 * - Three copy cards stacked or in a row
 * - On tap, copies the value to clipboard
 * - Shows a brief "copied!" toast feedback
 * - Designed for mobile-first tap interaction
 */

import { useState, useEffect } from 'react';

const QuickCopyEssentials = ({
  wifiPass = 'WIFI_PASSWORD',
  doorCode = '1234',
  checkOutTime = '11:00 AM',
}) => {
  const [copied, setCopied] = useState({
    wifi: false,
    door: false,
    checkout: false,
  });

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({
        ...prev,
        [text.slice(0, 10).toLowerCase()]: true,
      }));
      // Reset after 2 seconds
      const key = text.slice(0, 10).toLowerCase();
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Handle card copy clicks
  const handleCopy = (type) => {
    let text;
    if (type === 'wifi') {
      text = wifiPass || 'your-wifi-password';
      copyToClipboard(text);
    } else if (type === 'door') {
      text = doorCode || 'your-door-code';
      copyToClipboard(text);
    } else if (type === 'checkout') {
      text = checkOutTime || 'your-check-out-time';
      copyToClipboard(text);
    }
  };

  // Render copy cards
  return (
    <div className="bg-white rounded-card border border-shadow p-4 md:p-6 space-y-3">
      {/* Wi-Fi card */}
      <div
        className`
          bg-gray-light rounded-md p-3 flex items-center gap-3 cursor-pointer
          hover:bg-white transition-colors
          ${copied.wifi ? 'bg-green-100 text-green-800' : ''}
        `
        onClick={() => handleCopy('wifi')}
        role="button"
        aria-label="Copy Wi-Fi password"
      >
        <svg
          className="h-5 w-5 text-gray-400 ${copied.wifi ? 'text-green-500' : ''} transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="9" y="9" x2="9" y2="9" rx="2" ry="2" />
          <path d="M5 15l14 0" />
        </svg>
        <span>Wi-Fi Password</span>
      </div>

      {/* Door Code card */}
      <div
        className`
          bg-gray-light rounded-md p-3 flex items-center gap-3 cursor-pointer
          hover:bg-white transition-colors
          ${copied.door ? 'bg-green-100 text-green-800' : ''}
        `
        onClick={() => handleCopy('door')}
        role="button"
        aria-label="Copy door code"
      >
        <svg
          className="h-5 w-5 text-gray-400 ${copied.door ? 'text-green-500' : ''} transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M3 12a1 1 0 011-1h14a1 1 0 010 2h-3.8" />
          <path d="M7 23l3.8-6.8" />
        </svg>
        <span>Door Code</span>
      </div>

      {/* Check-Out Time card */}
      <div
        className`
          bg-gray-light rounded-md p-3 flex items-center gap-3 cursor-pointer
          hover:bg-white transition-colors
          ${copied.checkout ? 'bg-green-100 text-green-800' : ''}
        `
        onClick={() => handleCopy('checkout')}
        role="button"
        aria-label="Copy check-out time"
      >
        <svg
          className="h-5 w-5 text-gray-400 ${copied.checkout ? 'text-green-500' : ''} transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 18 12 6 12" />
        </svg>
        <span>Check-Out Time</span>
      </div>
    </div>
  );
};

export default QuickCopyEssentials;