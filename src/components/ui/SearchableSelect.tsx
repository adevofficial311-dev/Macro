import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function SearchableSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  error 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-cb-text-muted">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-11 px-4 bg-cb-surface border rounded-lg text-sm text-left flex items-center justify-between transition-all
          ${error ? 'border-cb-red' : 'border-cb-border hover:border-cb-border/80'}
          ${isOpen ? 'ring-1 ring-cb-yellow/20 border-cb-yellow' : ''}
          ${selectedOption ? 'text-white' : 'text-cb-text-muted/50'}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-cb-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-cb-surface border border-cb-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-cb-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cb-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-cb-bg border border-cb-border rounded-md text-sm text-white placeholder-cb-text-muted/50 focus:outline-none focus:border-cb-yellow"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1 hide-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-cb-text-muted text-center">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-cb-text rounded-md hover:bg-cb-bg hover:text-white flex items-center justify-between"
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check size={14} className="text-cb-yellow shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      {error && (
        <span className="text-xs text-cb-red">{error}</span>
      )}
    </div>
  );
}
