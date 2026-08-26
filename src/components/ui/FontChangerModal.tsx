import { X, Check, RotateCcw, Type, Sliders } from 'lucide-react';
import { useFont, FONT_PRESETS, FontScale } from '../../context/FontContext';
import { motion, AnimatePresence } from 'motion/react';

export function FontChangerModal() {
  const {
    currentPreset,
    setPreset,
    fontScale,
    setFontScale,
    isModalOpen,
    closeModal,
    resetToDefault,
  } = useFont();

  if (!isModalOpen) return null;

  const fontSizes: { scale: FontScale; label: string; percent: string }[] = [
    { scale: 'compact', label: 'Compact', percent: '92%' },
    { scale: 'normal', label: 'Standard', percent: '100%' },
    { scale: 'large', label: 'Large', percent: '108%' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-cb-surface border border-cb-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-cb-border flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cb-yellow/10 border border-cb-yellow/30 flex items-center justify-center text-cb-yellow">
                <Type size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Font & Size Settings
                </h2>
                <p className="text-xs text-cb-text-muted">
                  Choose between Pixel or Normal font and adjust text size.
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-lg bg-cb-bg border border-cb-border text-cb-text-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 flex flex-col gap-6">
            
            {/* Section 1: Font Style Selection (Pixel vs Normal) */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-cb-text-muted uppercase tracking-wider">
                Font Style
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FONT_PRESETS.map((preset) => {
                  const isSelected = currentPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setPreset(preset.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cb-yellow/10 border-cb-yellow ring-1 ring-cb-yellow/40 shadow-lg shadow-cb-yellow/10'
                          : 'bg-cb-bg border-cb-border hover:border-cb-border-hover hover:bg-cb-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-bold text-white text-sm">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-cb-yellow text-black flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      {/* Preview Text */}
                      <div
                        className="py-2 px-3 bg-black/60 rounded-lg border border-cb-border/60 text-cb-yellow text-xs font-bold truncate mb-2"
                        style={{ fontFamily: preset.fontDisplay }}
                      >
                        {preset.sampleText}
                      </div>

                      <p className="text-xs text-cb-text-muted">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Font Size Adjustment */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cb-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-cb-yellow" />
                  <span>Font Size</span>
                </span>
                <span className="text-[11px] text-cb-yellow font-mono font-bold">
                  {fontScale === 'compact' ? '92% Compact' : fontScale === 'large' ? '108% Large' : '100% Standard'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {fontSizes.map((item) => {
                  const isActive = fontScale === item.scale;
                  return (
                    <button
                      key={item.scale}
                      onClick={() => setFontScale(item.scale)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cb-yellow text-black shadow-md shadow-cb-yellow/20'
                          : 'bg-cb-bg text-cb-text-muted hover:text-white border border-cb-border hover:border-cb-border-hover'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">{item.percent}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-cb-border bg-black/40 flex items-center justify-between">
            <button
              onClick={resetToDefault}
              className="inline-flex items-center gap-1.5 text-xs text-cb-text-muted hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              onClick={closeModal}
              className="bg-cb-yellow hover:bg-cb-yellow-hover text-black font-extrabold text-xs px-5 py-2 rounded-lg transition-all active:scale-95 shadow-md shadow-cb-yellow/20 cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
