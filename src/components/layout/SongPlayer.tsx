import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

const SONG_URL = "https://archive.org/download/GymnopedieNo.1/Gymnopedie%20No.1.mp3";
const SONG_TITLE = "Gymnopédie No. 1";
const SONG_ARTIST = "Erik Satie (Peaceful Vibes)";

export function SongPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio play failed:", err);
        setIsPlaying(false);
      });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (isMuted && newVol > 0) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 group">
      <audio 
        ref={audioRef} 
        src={SONG_URL} 
        loop 
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Hidden Volume Slider */}
      <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cb-surface border border-cb-border rounded-xl p-3 flex items-center gap-3 shadow-xl">
        <button
          onClick={toggleMute}
          className="text-cb-text-muted hover:text-cb-yellow transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-24 h-1 bg-cb-border rounded-lg appearance-none cursor-pointer accent-cb-yellow"
        />
      </div>

      {/* Player Pill */}
      <div className="bg-cb-bg/95 border border-cb-border hover:border-cb-yellow/40 rounded-full shadow-lg p-2 pl-4 pr-2 flex items-center gap-4 transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-cb-yellow/10 border border-cb-yellow/20 flex items-center justify-center shrink-0">
          <Music size={14} className="text-cb-yellow" />
        </div>

        <div className="flex flex-col pr-2 min-w-[120px] max-w-[150px]">
          <span className="text-[11px] font-bold text-white truncate w-full block">
            {SONG_TITLE}
          </span>
          <span className="text-[9px] font-semibold text-cb-text-muted truncate w-full block">
            {SONG_ARTIST}
          </span>
        </div>

        <button
          onClick={togglePlay}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 shrink-0 ${
            isPlaying
              ? 'bg-cb-yellow text-black border border-cb-yellow shadow-sm'
              : 'bg-cb-surface border border-cb-border text-cb-text hover:text-white hover:border-cb-yellow/50'
          }`}
        >
          {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="ml-0.5 fill-current" />}
        </button>
      </div>
    </div>
  );
}
