/**
 * LocalSpotCard.jsx
 * 
 * Rounded 16px spot card, walking-time pill, price tier, Graph Trace trigger.
 * Member 2 component — appears in GuestWelcomeGuide and JudgeSplitDemo.
 * 
 * Props (expected from parent):
 * - spot: { id, name, category, description, priceTier, walkMins, vibes, score }
 * - onGraphTrace: (spotId) => void — click handler to open GraphTraceDrawer
 * - isSelected: boolean — whether this spot is currently filtered/active
 */

import { Button } from './Button.jsx';
import { Feather } from 'lucide-react';

const LocalSpotCard = ({ spot, onGraphTrace, isSelected = false }) => {
  const { id, name, category, description, priceTier, walkMins, vibes } = spot;

  return (
    <div
      className`
        group
        bg-white rounded-card border border-border
        shadow-sm hover:shadow-md transition-shadow cursor-pointer
        p-4 flex flex-col min-w-0
      `
      onClick={() => onGraphTrace && onGraphTrace(id)}
    >
      {/* Category badge */}
      <span className`
        inline-flex items-center gap-1.5 rounded-full bg-gray-light text-xs font-medium
        mb-3 px-2 py-0.5
      `>
        {category}
      </span>

      <h3 className="font-medium leading-truncate line-clamp-2 mb-2">{name}</h3>

      <p className="text-sm text-gray-600 line-clamp-1 flex items-center gap-1 mb-3">
        {description || 'A great local spot.'}
      </p>

      {/* Walking time pill */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-auto">
        <Feather name="map-pin" className="h-3 w-3" />
        <span>{walkMins} min walk</span>
      </div>

      {/* Price tier */}
      <span className`
        text-xs font-medium rounded bg-${priceTier === '$' ? 'green-100' : priceTier === '$$' ? 'amber-100' : 'red-100'}
        text-${priceTier === '$' ? 'green-800' : priceTier === '$$' ? 'amber-800' : 'red-800'}
        px-2 py-0.5 ml-auto
      `>
        {priceTier}
      </span>

      {/* Graph Trace trigger — subtle disclosure indicator */}
      <Button
        size="icon"
        variant="ghost"
        className="ml-auto p-1 rounded-xl hover:bg-gray-light transition-colors"
        aria-label="Why This Spot? Graph Trace"
        onClick={(e) => {
          e.stopPropagation();
          onGraphTrace && onGraphTrace(id);
        }}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 3h14l2 8L5 21z" />
          <path d="M9 17l3 3l3-3" />
        </svg>
      </Button>
    </div>
  );
};

export default LocalSpotCard;