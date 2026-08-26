import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

// Audio frequencies for Great Fairy's Fountain
const NOTES = {
  Bb1: 58.27,
  C2: 65.41,
  D2: 73.42,
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  Bb3: 233.08,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
};

// 4-measure iconic harp arpeggio cycle
const HARP_SEQUENCE = [
  // Measure 1: F Major 7/9
  { notes: [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.E5, NOTES.C5, NOTES.A4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.E5, NOTES.C5, NOTES.A4], pad: [NOTES.F2, NOTES.C3, NOTES.A3] },
  // Measure 2: D Minor 7/9
  { notes: [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5, NOTES.C5, NOTES.A4, NOTES.F4, NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5, NOTES.C5, NOTES.A4, NOTES.F4], pad: [NOTES.D2, NOTES.A2, NOTES.F3] },
  // Measure 3: Bb Major 7/9
  { notes: [NOTES.Bb3, NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.F4, NOTES.D4, NOTES.Bb3, NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.F4, NOTES.D4], pad: [NOTES.Bb1, NOTES.F2, NOTES.D3] },
  // Measure 4: C9 / C7
  { notes: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.Bb4, NOTES.D5, NOTES.Bb4, NOTES.G4, NOTES.E4, NOTES.C4, NOTES.E4, NOTES.G4, NOTES.Bb4, NOTES.D5, NOTES.Bb4, NOTES.G4, NOTES.E4], pad: [NOTES.C2, NOTES.G2, NOTES.E3] },
];

export function SongPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const currentMeasureRef = useRef(0);
  const currentNoteIndexRef = useRef(0);
  const padNodesRef = useRef<OscillatorNode[]>([]);

  // Keep volume in sync
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetVol = isMuted ? 0 : volume * 0.35;
      masterGainRef.current.gain.setTargetAtTime(targetVol, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(isMuted ? 0 : volume * 0.35, ctx.currentTime);
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, master: masterGainRef.current! };
  };

  const playHarpPluck = (ctx: AudioContext, master: GainNode, freq: number, time: number) => {
    // Primary plucked string oscillator
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    // Subtle 2nd harmonic sparkle
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    // Lowpass filter envelope for natural harp damping
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, time + 0.9);

    // Pluck amplitude envelope
    gain1.gain.setValueAtTime(0.0001, time);
    gain1.gain.linearRampToValueAtTime(0.45, time + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain1);
    gain1.connect(master);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 1.3);
    osc2.stop(time + 1.3);
  };

  const playPadChord = (ctx: AudioContext, master: GainNode, padFreqs: number[], time: number, duration: number) => {
    // Stop previous pad
    padNodesRef.current.forEach(osc => {
      try {
        osc.stop(time);
      } catch {
        // ignore
      }
    });
    padNodesRef.current = [];

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, time);
    padGain.gain.linearRampToValueAtTime(0.12, time + 0.4);
    padGain.gain.setValueAtTime(0.12, time + duration - 0.3);
    padGain.gain.linearRampToValueAtTime(0.0001, time + duration);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(450, time);

    padFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.connect(padFilter);
      osc.start(time);
      osc.stop(time + duration);
      padNodesRef.current.push(osc);
    });

    padFilter.connect(padGain);
    padGain.connect(master);
  };

  const scheduleNextNotes = () => {
    if (!isPlayingRef.current) return;
    const { ctx, master } = getAudioContext();

    const noteDuration = 0.135; // speed of 16th notes (slowed ambient feel)
    const measureDuration = noteDuration * 16;
    const now = ctx.currentTime;

    const measure = HARP_SEQUENCE[currentMeasureRef.current];

    // Trigger pad at start of measure
    if (currentNoteIndexRef.current === 0) {
      playPadChord(ctx, master, measure.pad, now, measureDuration);
    }

    // Trigger harp note
    const noteFreq = measure.notes[currentNoteIndexRef.current];
    playHarpPluck(ctx, master, noteFreq, now);
    setCurrentStep(prev => (prev + 1) % 16);

    // Advance index
    currentNoteIndexRef.current++;
    if (currentNoteIndexRef.current >= 16) {
      currentNoteIndexRef.current = 0;
      currentMeasureRef.current = (currentMeasureRef.current + 1) % HARP_SEQUENCE.length;
    }

    timerRef.current = window.setTimeout(() => {
      scheduleNextNotes();
    }, noteDuration * 1000);
  };

  const startPlayback = () => {
    const { ctx } = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    scheduleNextNotes();
  };

  const stopPlayback = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    padNodesRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // ignore
      }
    });
    padNodesRef.current = [];
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group select-none"
    >
      {/* Volume Bar Popover on Hover */}
      <div className="opacity-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cb-surface/95 border border-cb-border rounded-xl p-2 px-3 flex items-center gap-2.5 shadow-xl backdrop-blur-md">
        <button
          onClick={toggleMute}
          className="text-cb-text-muted hover:text-cb-yellow transition-colors cursor-pointer"
          aria-label="Toggle mute"
        >
          {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-20 h-1 bg-cb-border rounded-lg appearance-none cursor-pointer accent-cb-yellow"
          aria-label="Volume slider"
        />
        <span className="text-[10px] font-mono text-cb-text-muted">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Main Pill Player */}
      <div className="bg-cb-surface/95 border border-cb-border hover:border-cb-yellow/50 rounded-full shadow-2xl p-1.5 pl-3 pr-2 flex items-center gap-3 transition-all duration-300 backdrop-blur-md">
        {/* Animated Icon */}
        <div
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
            isPlaying
              ? 'bg-cb-yellow/20 text-cb-yellow ring-1 ring-cb-yellow/40 animate-pulse'
              : 'bg-cb-bg text-cb-text-muted hover:text-white'
          }`}
          title="Zelda Great Fairy Fountain"
        >
          <Sparkles size={14} />
        </div>

        {/* Track Details */}
        <div onClick={togglePlay} className="flex flex-col pr-1 min-w-[130px] max-w-[170px] cursor-pointer">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate block">
              Great Fairy Fountain
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-semibold text-cb-yellow truncate block">
              Zelda • Celestial Harp
            </span>
            {isPlaying && (
              <span className="flex items-center gap-0.5 ml-auto">
                <span className="w-0.5 h-2 bg-cb-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3 bg-cb-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-1.5 bg-cb-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 shrink-0 cursor-pointer ${
            isPlaying
              ? 'bg-cb-yellow text-black shadow-md shadow-cb-yellow/25 font-black'
              : 'bg-cb-bg border border-cb-border text-cb-text hover:text-white hover:border-cb-yellow/50'
          }`}
          title={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <Pause size={13} className="fill-current" />
          ) : (
            <Play size={13} className="ml-0.5 fill-current" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
