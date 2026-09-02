import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star } from 'lucide-react';

export const TIMEFRAMES = [
  { id: '1D', label: '1 day', shortLabel: '1D' },
  { id: '1W', label: '1 week', shortLabel: '1W' },
  { id: '1M', label: '1 month', shortLabel: 'M' },
  { id: '3M', label: '3 months', shortLabel: '3M' },
  { id: '6M', label: '6 months', shortLabel: '6M', starred: true },
  { id: '12M', label: '12 months', shortLabel: '12M' }
];

export default function TimeframeSelector({ selectedId, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption = TIMEFRAMES.find(t => t.id === selectedId) || TIMEFRAMES[2]; // Default to 1M

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button (Shows short code 'M' or selected label with dark styling) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500/50"
      >
        <span>{currentOption.shortLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu (Styled exactly like reference UI image) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] border border-zinc-800 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-1.5 space-y-1">
            {TIMEFRAMES.map((option) => {
              const isSelected = option.id === currentOption.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#333333] text-white font-bold shadow-inner'
                      : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.starred && (
                    <Star className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
