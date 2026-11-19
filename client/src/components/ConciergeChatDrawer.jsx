/**
 * ConciergeChatDrawer.jsx
 * 
 * Slide-up AI House & Neighborhood Concierge mobile chat widget.
 * Member 1 component — appears at the bottom of GuestWelcomeGuide.
 * 
 * Features:
 * - Slide-up drawer from bottom (mobile-friendly)
 * - Grounded Q&A over house manual + Relate property subgraph
 * - Pre-built quick questions (Wi-Fi, check-out, coffee, parking)
 * - Free-text question input
 * - Answer sourced from: (1) houseRules, (2) Relate subgraph, (3) offline template
 * - "Ask your host directly" fallback when answer not available
 */

import { useState, useEffect } from 'react';
import { XCircle, Menu, Mic, Send } from 'lucide-react';
import { Button } from './Button.jsx';

const ConciergeChatDrawer = ({
  propertyId = 'prop-1',
  onClose,
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! Ask me about Wi-Fi, check-out time, or local recommendations.' },
  ]);
  const [input, setInput] = useState('');

  // Toggle drawer open/closed
  const toggle = () => setOpen(!open);

  // Add a message to the chat
  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  // Process user question using the concierge agent
  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');

    // In a real app, this would call the API:
    // POST /api/concierge/chat { question, propertyId }
    // For now, we'll use a local client call or fallback
    const answer = await getConciergeAnswer(question, propertyId);
    setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
  };

  // Mock concierge answer — in production, this calls the server API
  const getConciergeAnswer = async (question, propertyId) => {
    const lower = question.toLowerCase().trim();

    // Quick questions with direct answers
    if (
      lower.includes('wifi') ||
      lower.includes('password') ||
      lower.includes('internet')
    ) {
      return "Your Wi-Fi password is: guest-wifi-123 (check the quick-copy cards above!)";
    }
    if (
      lower.includes('door code') ||
      lower.includes('lock') ||
      lower.includes('entry')
    ) {
      return "Your door code: 1234 (also on the quick-copy cards by the exit.)";
    }
    if (
      lower.includes('check-out') ||
      lower.includes('checkout') ||
      lower.includes('departure')
    ) {
      return "Check-out time is 11:00 AM. Please leave the key on the table.";
    }
    if (lower.includes('coffee')) {
      return "We have a coffee maker in the kitchen. The closest cafe is about 5 minutes walk away.";
    }
    if (lower.includes('parking') || lower.includes('car')) {
      return "Parking is available on the street. Please check the welcome guide for details.";
    }

    // For other questions, try the Relate subgraph via the concierge agent
    // (In a real deployment, this would be an API call to the backend)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try to get answer from Relate graph
      const cypher = `
        MATCH (p:Property {id: $propId})
        RETURN p.houseRules AS houseRules
      `;
      // Would call: const { result } = await relate.cypher(cypher, { propId });
      // For now, fallback to template

      // If house rules contain relevant info, return it
      // Otherwise, return generic helpful response
      return "That's a great question! Check your personalized welcome guide for the full details, or I can help you with Wi-Fi, check-out time, coffee options, and parking arrangements.";
    } catch (e) {
      console.error('Concierge error:', e.message);
      return "I'm not sure about that — please check your welcome guide or ask your host directly. They'll have all the details about your stay.";
    }
  };

  return (
    <div>
      {/* Mobile: show drawer button when closed */}
      {!open && (
        <Button
          onClick={toggle}
          className="mb-2 justify-self-end"
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
          Concierge
        </Button>
      )}

      {/* Open drawer */}
      {open || (
        <div
          className`
            fixed bottom-0 left-0 right-0 bg-white border-t border-shadow
            z-50 transform translateY-full transition-transform duration-300
            {open ? 'translateY(0)' : ''}
          `
        >
          <div className="p-4 space-y-3">
            {/* Message history */}
            <div className="h-48 overflow-y-auto space-y-2 text-sm">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className`
                    max-w-70 rounded-md p-2.5 ${msg.role === 'user' ? 'bg-coral text-white self-end' : 'bg-gray-light self-start'}
                  `
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className`
                  flex-1 rounded-md border border-border px-3 py-2 text-sm focus:outline-none
                  focus:ring-2 focus:ring-coral focus:ring-offset-2
                `
                aria-label="Ask concierge question"
              />
              <button
                onClick={handleSend}
                className`
                  bg-coral text-white rounded-md px-4 py-2 text-sm hover:bg-coralLight transition-colors
                `
                aria-label="Send question to concierge"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setOpen(false);
              onClose && onClose();
            }}
            className`
              absolute right-4 top-4 text-gray-400 hover:text-ink transition-colors
              z-10
            `
            aria-label="Close concierge chat"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConciergeChatDrawer;