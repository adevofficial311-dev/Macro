import { useEffect, useRef, useState } from 'react';
import {
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';

import fairyFountainAudio from '../../Audio/zelda_fairy_fountain.mp3';

export function SongPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create and configure the real MP3 audio element.
  useEffect(() => {
    const audio = new Audio(fairyFountainAudio);

    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.5;

    audioRef.current = audio;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      console.error(
        'Failed to load Zelda Great Fairy Fountain audio.',
        audio.error
      );
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.currentTime = 0;

      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);

      audioRef.current = null;
    };
  }, []);

  // Keep the actual MP3 volume synchronized with the UI.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const startPlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      console.error('Audio element has not been initialized.');
      return;
    }

    try {
      audio.volume = isMuted ? 0 : volume;

      await audio.play();

      setIsPlaying(true);
    } catch (error) {
      console.error('Unable to play audio:', error);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      void startPlayback();
    }
  };

  const toggleMute = () => {
    setIsMuted((previous) => !previous);
  };

  const handleVolumeChange = (newVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, newVolume));

    setVolume(safeVolume);

    if (safeVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const displayedVolume = isMuted ? 0 : volume;

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="
        fixed
        bottom-6
        right-6
        z-40
        flex
        flex-col
        items-end
        gap-2
        group
        select-none
      "
    >
      {/* Volume Popover */}
      <div
        className="
          opacity-0
          translate-y-2
          pointer-events-none
          group-hover:pointer-events-auto
          group-hover:opacity-100
          group-hover:translate-y-0
          transition-all
          duration-300
          bg-cb-surface/95
          border
          border-cb-border
          rounded-xl
          p-2
          px-3
          flex
          items-center
          gap-2.5
          shadow-xl
          backdrop-blur-md
        "
      >
        <button
          type="button"
          onClick={toggleMute}
          className="
            text-cb-text-muted
            hover:text-cb-yellow
            transition-colors
            cursor-pointer
          "
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          title={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={14} />
          ) : (
            <Volume2 size={14} />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={displayedVolume}
          onChange={(event) =>
            handleVolumeChange(Number.parseFloat(event.target.value))
          }
          className="
            w-20
            h-1
            bg-cb-border
            rounded-lg
            appearance-none
            cursor-pointer
            accent-cb-yellow
          "
          aria-label="Music volume"
        />

        <span className="text-[10px] font-mono text-cb-text-muted min-w-[28px] text-right">
          {Math.round(displayedVolume * 100)}%
        </span>
      </div>

      {/* Main Player */}
      <div
        className="
          bg-cb-surface/95
          border
          border-cb-border
          hover:border-cb-yellow/50
          rounded-full
          shadow-2xl
          p-1.5
          pl-3
          pr-2
          flex
          items-center
          gap-3
          transition-all
          duration-300
          backdrop-blur-md
        "
      >
        {/* Animated Icon */}
        <button
          type="button"
          onClick={togglePlay}
          className={`
            w-8
            h-8
            rounded-full
            flex
            items-center
            justify-center
            shrink-0
            cursor-pointer
            transition-all
            duration-300
            ${
              isPlaying
                ? `
                  bg-cb-yellow/20
                  text-cb-yellow
                  ring-1
                  ring-cb-yellow/40
                  animate-pulse
                `
                : `
                  bg-cb-bg
                  text-cb-text-muted
                  hover:text-white
                `
            }
          `}
          title={
            isPlaying
              ? 'Pause Great Fairy Fountain'
              : 'Play Great Fairy Fountain'
          }
          aria-label={
            isPlaying
              ? 'Pause Great Fairy Fountain'
              : 'Play Great Fairy Fountain'
          }
        >
          <Sparkles size={14} />
        </button>

        {/* Track Details */}
        <button
          type="button"
          onClick={togglePlay}
          className="
            flex
            flex-col
            pr-1
            min-w-[130px]
            max-w-[170px]
            cursor-pointer
            text-left
          "
          title={isPlaying ? 'Pause music' : 'Play music'}
        >
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
              <span
                className="
                  flex
                  items-center
                  gap-0.5
                  ml-auto
                  shrink-0
                "
                aria-hidden="true"
              >
                <span
                  className="
                    w-0.5
                    h-2
                    bg-cb-yellow
                    rounded-full
                    animate-bounce
                  "
                  style={{ animationDelay: '0ms' }}
                />

                <span
                  className="
                    w-0.5
                    h-3
                    bg-cb-yellow
                    rounded-full
                    animate-bounce
                  "
                  style={{ animationDelay: '150ms' }}
                />

                <span
                  className="
                    w-0.5
                    h-1.5
                    bg-cb-yellow
                    rounded-full
                    animate-bounce
                  "
                  style={{ animationDelay: '300ms' }}
                />
              </span>
            )}
          </div>
        </button>

        {/* Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`
            w-8
            h-8
            flex
            items-center
            justify-center
            rounded-full
            transition-all
            duration-200
            active:scale-95
            shrink-0
            cursor-pointer
            ${
              isPlaying
                ? `
                  bg-cb-yellow
                  text-black
                  shadow-md
                  shadow-cb-yellow/25
                  font-black
                `
                : `
                  bg-cb-bg
                  border
                  border-cb-border
                  text-cb-text
                  hover:text-white
                  hover:border-cb-yellow/50
                `
            }
          `}
          title={isPlaying ? 'Pause music' : 'Play music'}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <Pause
              size={13}
              className="fill-current"
            />
          ) : (
            <Play
              size={13}
              className="ml-0.5 fill-current"
            />
          )}
        </button>
      </div>
    </motion.div>
  );
}
