import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FontPreset {
  id: 'pixel' | 'normal';
  name: string;
  badge: string;
  description: string;
  fontSans: string;
  fontDisplay: string;
  fontMono: string;
  sampleText: string;
  letterSpacing?: string;
}

export type FontScale = 'compact' | 'normal' | 'large';

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'pixel',
    name: 'Pixel Font',
    badge: 'Pixel / 8-Bit',
    description: 'Retro pixelated gaming typography with arcade headings.',
    fontSans: "'Pixelify Sans', sans-serif",
    fontDisplay: "'Press Start 2P', cursive, monospace",
    fontMono: "'VT323', monospace",
    sampleText: 'ONE SHOT COMBO LOADOUT VERIFIED',
    letterSpacing: '0.02em',
  },
  {
    id: 'normal',
    name: 'Normal Font',
    badge: 'Standard UI',
    description: 'Clean, modern high-legibility standard typeface.',
    fontSans: "'Inter', system-ui, -apple-system, sans-serif",
    fontDisplay: "'Space Grotesk', system-ui, -apple-system, sans-serif",
    fontMono: "ui-monospace, monospace",
    sampleText: 'OPTIMIZED LATENCY 0MS EXECUTION',
    letterSpacing: 'normal',
  }
];

interface FontContextType {
  currentPreset: FontPreset;
  setPreset: (presetId: string) => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  resetToDefault: () => void;
}

const STORAGE_PRESET_KEY = 'cb_font_preset_v2';
const STORAGE_SCALE_KEY = 'cb_font_scale_v2';

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [presetId, setPresetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRESET_KEY);
      if (saved && FONT_PRESETS.some(p => p.id === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'pixel';
  });

  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCALE_KEY);
      if (saved === 'compact' || saved === 'normal' || saved === 'large') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'normal';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentPreset = FONT_PRESETS.find(p => p.id === presetId) || FONT_PRESETS[0];

  // Apply CSS variables and update root styling whenever preset or scale changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Set custom CSS properties
    root.style.setProperty('--cb-font-sans', currentPreset.fontSans);
    root.style.setProperty('--cb-font-display', currentPreset.fontDisplay);
    root.style.setProperty('--cb-font-mono', currentPreset.fontMono);
    root.style.setProperty('--cb-letter-spacing', currentPreset.letterSpacing || 'normal');

    // Font Scale Multiplier
    const scaleMultipliers: Record<FontScale, string> = {
      compact: '0.92',
      normal: '1',
      large: '1.08',
    };
    root.style.setProperty('--cb-font-scale', scaleMultipliers[fontScale]);
    
    // Set attribute on body for specific CSS scoping
    document.body.setAttribute('data-font-preset', currentPreset.id);
    document.body.setAttribute('data-font-scale', fontScale);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_PRESET_KEY, currentPreset.id);
      localStorage.setItem(STORAGE_SCALE_KEY, fontScale);
    } catch {
      // ignore storage error
    }
  }, [currentPreset, fontScale]);

  const setPreset = (id: string) => {
    if (FONT_PRESETS.some(p => p.id === id)) {
      setPresetId(id);
    }
  };

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
  };

  const resetToDefault = () => {
    setPresetId('pixel');
    setFontScaleState('normal');
  };

  return (
    <FontContext.Provider
      value={{
        currentPreset,
        setPreset,
        fontScale,
        setFontScale,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        toggleModal: () => setIsModalOpen(prev => !prev),
        resetToDefault,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
