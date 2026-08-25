import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CHARIZARD_SPRITE = "https://play.pokemonshowdown.com/sprites/ani/charizard.gif";
const CHARIZARD_MEGA_SPRITE = "https://play.pokemonshowdown.com/sprites/ani/charizard-megax.gif"; 
const PIKACHU_SPRITE = "https://play.pokemonshowdown.com/sprites/ani/pikachu.gif";
const BLASTOISE_SPRITE = "https://play.pokemonshowdown.com/sprites/ani/blastoise.gif";

type CharizardMode = 
  | 'normal' | 'spitting_fire' | 'sleeping' | 'waking' 
  | 'secret_pikachu' | 'defeated_flying'
  | 'secret_blastoise' | 'defeated_washed'
  | 'hidden' | 'nuking' | 'destroyed';

export function Charizard() {
  const [mode, setMode] = useState<CharizardMode>('normal');
  const [isMega, setIsMega] = useState(false);
  const [embers, setEmbers] = useState<any[]>([]);
  const [clickCount, setClickCount] = useState(0);
  
  // Refs for performance loop
  const charizardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const vel = useRef({ vx: 4, vy: 3 });
  
  const modeRef = useRef(mode);
  const isTiredRef = useRef(false);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Audio Refs
  const audioNormalRef = useRef<HTMLAudioElement | null>(null);
  const audioMegaRef = useRef<HTMLAudioElement | null>(null);
  const audioPikachuRef = useRef<HTMLAudioElement | null>(null);
  const audioBlastoiseRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioNormalRef.current = new Audio('https://play.pokemonshowdown.com/audio/cries/charizard.mp3');
    audioNormalRef.current.volume = 0.6;
    audioMegaRef.current = new Audio('https://play.pokemonshowdown.com/audio/cries/charizard-megax.mp3');
    audioMegaRef.current.volume = 0.8;
    audioPikachuRef.current = new Audio('https://play.pokemonshowdown.com/audio/cries/pikachu.mp3');
    audioPikachuRef.current.volume = 0.9;
    audioBlastoiseRef.current = new Audio('https://play.pokemonshowdown.com/audio/cries/blastoise.mp3');
    audioBlastoiseRef.current.volume = 1.0;
    
    // Get tired after 12 seconds
    const timer = setTimeout(() => {
      isTiredRef.current = true;
    }, 12000);
    
    return () => clearTimeout(timer);
  }, []);

  const update = () => {
    if (!charizardRef.current || !innerRef.current) return;
    
    const currentMode = modeRef.current;
    
    if (currentMode !== 'normal' && currentMode !== 'sleeping') {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    if (isTiredRef.current && currentMode === 'normal') {
      const videoElement = document.getElementById('cinematic-video-container');
      let targetX = window.innerWidth / 2 - 40;
      let targetY = window.innerHeight - 85;

      if (videoElement) {
        const rect = videoElement.getBoundingClientRect();
        targetX = rect.left + rect.width / 2 - 40;
        targetY = rect.top - 65; 
      }
      
      const dx = targetX - pos.current.x;
      const dy = targetY - pos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) {
        pos.current.x = targetX;
        pos.current.y = targetY;
        setMode('sleeping');
      } else {
        vel.current.vx = (dx / dist) * Math.min(3, dist / 10);
        vel.current.vy = (dy / dist) * Math.min(3, dist / 10);
      }
    } else if (currentMode === 'normal') {
      if (pos.current.x <= 0 || pos.current.x + 80 >= window.innerWidth) {
        vel.current.vx *= -1;
        pos.current.x = Math.max(0, Math.min(pos.current.x, window.innerWidth - 80));
      }
      if (pos.current.y <= 0 || pos.current.y + 80 >= window.innerHeight) {
        vel.current.vy *= -1;
        pos.current.y = Math.max(0, Math.min(pos.current.y, window.innerHeight - 80));
      }
    }

    if (currentMode === 'normal') {
      pos.current.x += vel.current.vx;
      pos.current.y += vel.current.vy;
    }
    
    charizardRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    
    if (currentMode === 'normal') {
      innerRef.current.style.transform = `scaleX(${vel.current.vx > 0 ? -1 : 1})`;
    } else if (currentMode === 'sleeping') {
      innerRef.current.style.transform = `scaleX(1)`;
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const triggerScreenShake = (intensity: number, duration: number) => {
    if (!document.getElementById('shake-style')) {
      const style = document.createElement('style');
      style.id = 'shake-style';
      document.head.appendChild(style);
    }
    const style = document.getElementById('shake-style') as HTMLStyleElement;
    style.innerHTML = `
      @keyframes charizard-shake {
        0%, 100% { transform: translate3d(0, 0, 0); }
        10%, 30%, 50%, 70%, 90% { transform: translate3d(-${intensity}px, ${intensity/2}px, 0) rotate(-1deg); }
        20%, 40%, 60%, 80% { transform: translate3d(${intensity}px, -${intensity/2}px, 0) rotate(1deg); }
      }
    `;
    document.body.style.animation = `charizard-shake ${duration}ms cubic-bezier(.36,.07,.19,.97) both`;
    setTimeout(() => { document.body.style.animation = ''; }, duration);
  };

  const triggerNuke = () => {
    setMode('nuking');
    setIsMega(true);
    
    pos.current = { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 };
    if (charizardRef.current) {
      charizardRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    }
    
    if (audioMegaRef.current) {
      audioMegaRef.current.currentTime = 0;
      audioMegaRef.current.play().catch(() => {});
    }
    triggerScreenShake(8, 1500);

    setTimeout(() => {
      triggerScreenShake(20, 600);
    }, 1500);

    setTimeout(() => {
      triggerScreenShake(100, 4000); 
      if (audioMegaRef.current) {
        audioMegaRef.current.currentTime = 0;
        audioMegaRef.current.play().catch(() => {});
        setTimeout(() => {
          if (audioNormalRef.current) {
            audioNormalRef.current.currentTime = 0;
            audioNormalRef.current.play().catch(() => {});
          }
        }, 150);
      }
      setMode('destroyed');
    }, 2100);
  };

  const resetCharizard = () => {
    setMode('normal');
    setIsMega(false);
    setClickCount(0);
    isTiredRef.current = false;
    
    setTimeout(() => {
      isTiredRef.current = true;
    }, 12000);
    
    pos.current = { x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40 };
    vel.current = { vx: 4, vy: 3 };
  };

  const handleClick = () => {
    if (['nuking', 'destroyed', 'waking', 'hidden', 'spitting_fire'].includes(mode) || mode.startsWith('secret_') || mode.startsWith('defeated_')) return;
    
    if (mode === 'sleeping') {
      setMode('waking');
      setIsMega(true);
      
      if (innerRef.current) {
        innerRef.current.style.transform = `scaleX(-1)`;
      }

      setTimeout(() => {
        if (audioMegaRef.current) {
          audioMegaRef.current.currentTime = 0;
          audioMegaRef.current.play().catch(() => {});
        }
        triggerScreenShake(10, 1000);
        
        setTimeout(() => {
          // Choose 1 of 2 Random Secret Endings!
          const r = Math.random();
          if (r < 0.5) {
            // PIKACHU ENDING
            setMode('secret_pikachu');
            if (audioPikachuRef.current) {
              audioPikachuRef.current.currentTime = 0;
              audioPikachuRef.current.play().catch(() => {});
            }
            setTimeout(() => {
              triggerScreenShake(30, 800);
              setMode('defeated_flying');
              setTimeout(() => {
                setMode('hidden');
                setTimeout(() => resetCharizard(), 500);
              }, 1200);
            }, 1200);

          } else {
            // BLASTOISE ENDING
            setMode('secret_blastoise');
            if (audioBlastoiseRef.current) {
              audioBlastoiseRef.current.currentTime = 0;
              audioBlastoiseRef.current.play().catch(() => {});
            }
            setTimeout(() => {
              triggerScreenShake(40, 2500); // Continuous shake for water beam
              setMode('defeated_washed');
              setTimeout(() => {
                setMode('hidden');
                setTimeout(() => resetCharizard(), 500);
              }, 2500);
            }, 1000); // Slide in time
          }
        }, 1500);
      }, 800);
      return;
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount === 5) {
      triggerNuke();
      return;
    }
    
    setMode('spitting_fire');
    const goesMega = Math.random() < 0.25;
    setIsMega(goesMega);
    
    if (goesMega && audioMegaRef.current) {
      audioMegaRef.current.currentTime = 0;
      audioMegaRef.current.play().catch(() => {});
    } else if (!goesMega && audioNormalRef.current) {
      audioNormalRef.current.currentTime = 0;
      audioNormalRef.current.play().catch(() => {});
    }

    triggerScreenShake(goesMega ? 25 : 12, goesMega ? 1500 : 1000);
    
    const newEmbers = Array.from({ length: 60 }).map((_, i) => {
      const colorNormal = Math.random() > 0.6 ? '#FFFFFF' : Math.random() > 0.3 ? '#FFEB3B' : '#FF9800';
      const colorMega = Math.random() > 0.6 ? '#FFFFFF' : Math.random() > 0.3 ? '#00E5FF' : '#0044FF';
      return {
        id: i,
        angle: (Math.random() - 0.5) * 50,
        distance: 250 + Math.random() * 500,
        duration: 0.3 + Math.random() * 0.8,
        size: 3 + Math.random() * 10,
        delay: Math.random() * 0.3,
        color: goesMega ? colorMega : colorNormal
      };
    });
    setEmbers(newEmbers);
    
    setTimeout(() => {
      setMode('normal');
      setTimeout(() => setIsMega(false), 500);
    }, goesMega ? 1500 : 1200);
  };

  const themeColors = isMega 
    ? { glow: '#00E5FF', mid: '#00E5FF', outer: '#0044FF', shadow: 'rgba(0,229,255,0.7)', ambient: 'rgba(0,100,255,0.3)' }
    : { glow: '#E50000', mid: '#FFEB3B', outer: '#E50000', shadow: 'rgba(229,0,0,0.5)', ambient: 'rgba(255,50,0,0.2)' };

  return (
    <>
      {/* Destroyed Reality Screen */}
      <AnimatePresence>
        {mode === 'destroyed' && (
          <motion.div 
            initial={{ opacity: 1, backgroundColor: '#FFFFFF' }}
            animate={{ opacity: 1, backgroundColor: '#000000' }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 0 }}
                  animate={{ y: window.innerHeight + 20, x: `calc(${Math.random() * 100}vw + ${Math.random() * 200 - 100}px)`, opacity: [0, Math.random() * 0.8 + 0.2, 0] }}
                  transition={{ duration: 3 + Math.random() * 7, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
                  className="absolute w-1 h-1 bg-[#E50000] rounded-full blur-[1px]"
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.9, filter: 'blur(20px)', opacity: 0 }}
              animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
              transition={{ delay: 2, duration: 2, ease: "easeOut" }}
              className="text-center flex flex-col items-center px-4 relative z-10"
            >
              <h1 className="text-5xl md:text-8xl font-black text-[#E50000] tracking-widest uppercase mb-4 drop-shadow-[0_0_30px_rgba(229,0,0,0.8)]">
                The Web Is Destroyed
              </h1>
              <p className="text-lg md:text-xl text-gray-500 tracking-widest uppercase mb-12">
                Charizard has reduced everything to ashes.
              </p>
              <button 
                onClick={resetCharizard}
                className="px-8 py-4 border-2 border-[#E50000] text-[#E50000] hover:bg-[#E50000] hover:text-black hover:shadow-[0_0_30px_rgba(229,0,0,0.8)] transition-all duration-300 font-bold uppercase tracking-widest rounded-lg"
              >
                Restore Reality
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blastoise Wash Flash */}
      <AnimatePresence>
        {mode === 'defeated_washed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="fixed inset-0 bg-[#00BFFF] mix-blend-overlay z-[9998] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Spitting Fire Flash */}
      <AnimatePresence>
        {mode === 'spitting_fire' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: isMega ? 1.5 : 1.2, times: [0, 0.1, 0.3, 0.7, 1] }}
            className="fixed inset-0 pointer-events-none z-[9998]"
            style={{ backgroundColor: themeColors.ambient, mixBlendMode: 'screen' }}
          />
        )}
      </AnimatePresence>

      <div
        ref={charizardRef}
        className="fixed top-0 left-0 z-[9999] cursor-pointer pointer-events-auto"
        style={{
          width: isMega ? 100 : 80,
          height: isMega ? 100 : 80,
          opacity: ['destroyed', 'hidden'].includes(mode) ? 0 : 1,
          pointerEvents: ['destroyed', 'hidden', 'defeated_flying', 'defeated_washed', 'secret_blastoise', 'secret_pikachu'].includes(mode) ? 'none' : 'auto',
          transition: 'opacity 0.2s'
        }}
        onClick={handleClick}
      >
        <div 
          ref={innerRef}
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
        >
          {/* Zzz for sleeping */}
          <AnimatePresence>
            {mode === 'sleeping' && (
              <motion.div 
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -30, x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 right-0 text-xl font-bold text-white z-20 drop-shadow-md"
              >
                Zzz
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Charizard Image */}
          <motion.img 
            src={isMega ? CHARIZARD_MEGA_SPRITE : CHARIZARD_SPRITE} 
            alt="Charizard" 
            className="w-full h-full object-contain relative z-10"
            style={{ 
              filter: `drop-shadow(0 0 15px ${themeColors.shadow}) ${(mode === 'sleeping') ? 'brightness(0.6)' : ''}`,
            }}
            draggable={false}
            initial={false}
            animate={
              mode === 'nuking' ? { y: [0, -10, 10, -5, 5, 0], x: [0, 5, -5, 0], scale: [1, 1.2, 0.8, 0], rotate: [0, -5, 5, -10, 10, -20, 20, -180, -360], filter: ["brightness(1)", "brightness(2)", "brightness(5)"] } 
              : mode === 'spitting_fire' ? { x: [0, 8, -8, 8, -4, 0], y: [0, -5, 5, -4, 4, 0], scale: 1, rotate: 0, opacity: 1, filter: "brightness(1)" } 
              : mode === 'waking' ? { y: [0, -2, 2, 0], x: 0, scale: 1, rotate: 0, opacity: 1, filter: "brightness(1)" }
              : mode === 'defeated_flying' ? { x: -1000, y: -500, rotate: -720, scale: 0, opacity: 0 }
              : mode === 'defeated_washed' ? { x: 2500, y: -100, rotate: 2160, opacity: 0, scale: 0.2 }
              : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, filter: "brightness(1)" }
            }
            transition={{ 
              duration: mode === 'nuking' ? 2.1 
                        : mode === 'waking' ? 0.1 
                        : mode === 'defeated_flying' ? 1
                        : mode === 'defeated_washed' ? 1.5
                        : 0.3, 
              times: mode === 'nuking' ? [0, 0.5, 0.8, 1] : undefined,
              repeat: mode === 'waking' ? Infinity : mode === 'spitting_fire' ? (isMega ? 5 : 4) : 0 
            }}
          />

          {/* --- PIKACHU SEQUENCE --- */}
          <AnimatePresence>
            {(mode === 'secret_pikachu' || mode === 'defeated_flying') && (
              <motion.div 
                initial={{ x: 500, y: -200, scale: 0 }}
                animate={{ x: 100, y: -50, scale: 1.5 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100, exit: { duration: 0.3 } }}
                className="absolute z-50 flex items-center justify-center pointer-events-none"
              >
                <img src={PIKACHU_SPRITE} alt="Pikachu" className="w-24 h-24 drop-shadow-[0_0_15px_#FFEB3B]" />
                {mode === 'defeated_flying' && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: [0, 1, 0.5, 1, 0] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="absolute right-[50px] h-8 origin-right"
                    style={{ background: 'linear-gradient(90deg, #FFFFFF, #FFEB3B)', filter: 'blur(2px)', boxShadow: '0 0 20px #FFEB3B', borderRadius: '10px', transform: 'rotate(15deg)' }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- BLASTOISE SEQUENCE --- */}
          <AnimatePresence>
            {(mode === 'secret_blastoise' || mode === 'defeated_washed') && (
              <motion.div 
                initial={{ x: -800, y: 20, scale: 1.5 }}
                animate={{ x: -180, y: -20 }}
                exit={{ opacity: 0, x: -800 }}
                transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
                className="absolute z-50 flex items-center justify-center pointer-events-none"
              >
                <img src={BLASTOISE_SPRITE} alt="Blastoise" className="w-40 h-40 drop-shadow-[0_0_20px_#00BFFF]" />
                
                {/* Huge Hydro Pump */}
                {mode === 'defeated_washed' && (
                  <div className="absolute left-[100px] flex items-center z-40">
                     <motion.div 
                       initial={{ width: 0, opacity: 0 }}
                       animate={{ width: 2000, opacity: [0, 1, 1, 1, 0] }}
                       transition={{ duration: 2.5, times: [0, 0.05, 0.1, 0.8, 1] }}
                       className="h-24 origin-left rounded-r-full relative flex items-center"
                       style={{ 
                         background: 'linear-gradient(90deg, #FFFFFF 0%, #00FFFF 20%, #0044FF 100%)', 
                         filter: 'blur(2px)', 
                         boxShadow: '0 0 50px #00BFFF, 0 0 100px #0044FF' 
                       }}
                     >
                        <motion.div 
                          animate={{ scaleY: [0.8, 1.2, 0.9, 1.1] }}
                          transition={{ repeat: Infinity, duration: 0.1 }}
                          className="w-full h-12 bg-white blur-md absolute left-0" 
                        />
                     </motion.div>
                     
                     {/* Water splashes */}
                     {Array.from({ length: 40 }).map((_, i) => (
                       <motion.div
                         key={i}
                         initial={{ x: 0, y: 0, scale: Math.random() * 2, opacity: 1 }}
                         animate={{ 
                           x: 1000 + Math.random() * 1000, 
                           y: (Math.random() - 0.5) * 800,
                           opacity: 0
                         }}
                         transition={{ 
                           duration: 0.5 + Math.random() * 1,
                           repeat: Infinity,
                           ease: "easeOut"
                         }}
                         className="absolute w-4 h-4 bg-[#00FFFF] rounded-full blur-[1px]"
                         style={{ left: Math.random() * 200 }}
                       />
                     ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nuke Charge Sequence */}
          <AnimatePresence>
            {mode === 'nuking' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0.8, 1] }}
                  transition={{ duration: 2.1, times: [0, 0.5, 0.9, 1], ease: "easeIn" }}
                  className="fixed inset-0 pointer-events-none z-[9998]"
                  style={{ mixBlendMode: 'difference', backgroundColor: '#00E5FF' }}
                />
                <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: (Math.random() - 0.5) * window.innerWidth * 1.5, y: (Math.random() - 0.5) * window.innerHeight * 1.5, scale: Math.random() * 2 + 1, opacity: 0 }}
                      animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 0 }}
                      transition={{ duration: 0.5 + Math.random() * 1.5, ease: "circIn", delay: Math.random() * 0.5 }}
                      className="absolute w-4 h-1 bg-[#00E5FF] rounded-full blur-[1px]"
                      style={{ boxShadow: '0 0 15px #00E5FF' }}
                    />
                  ))}
                </div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 8, 4, 300], opacity: [0, 1, 1, 1], rotate: [0, 180, 360, 1080] }}
                  transition={{ duration: 2.1, times: [0, 0.5, 0.8, 1], ease: "anticipate" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-[9999] flex items-center justify-center"
                  style={{ background: '#FFFFFF', boxShadow: '0 0 150px 80px #00E5FF, 0 0 300px 150px #0044FF' }}
                >
                  <motion.div animate={{ scale: [1, 1.5, 0] }} transition={{ duration: 2.1, times: [0, 0.8, 1] }} className="w-12 h-12 bg-black rounded-full mix-blend-overlay" />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Normal Fire Breath */}
          <AnimatePresence>
            {mode === 'spitting_fire' && (
              <div className="absolute top-1/2 left-0 -translate-y-[60%] -translate-x-[20px] pointer-events-none rotate-180 origin-right flex items-center z-20">
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0.7, 1, 0], scale: [0, 2.5, 2, 3, 0] }} transition={{ duration: isMega ? 1.5 : 1.2, times: [0, 0.1, 0.4, 0.8, 1] }} className="absolute left-[-20px] w-[150px] h-[150px] blur-[50px] rounded-full z-[-2]" style={{ backgroundColor: themeColors.glow }} />
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: [0, isMega ? 450 : 350, isMega ? 380 : 280, isMega ? 500 : 400, 0], opacity: [0, 1, 0.9, 1, 0] }} transition={{ duration: isMega ? 1.5 : 1.2, times: [0, 0.1, 0.4, 0.8, 1] }} className="absolute left-0 h-4 origin-left z-10" style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #FFFDE7 50%, transparent 100%)', filter: 'blur(1px)', borderRadius: '50px' }} />
                <motion.div initial={{ width: 0, opacity: 0, scaleY: 0.5 }} animate={{ width: [0, isMega ? 550 : 450, isMega ? 450 : 350, isMega ? 600 : 500, 0], opacity: [0, 1, 0.8, 1, 0], scaleY: [0.5, 1.8, 1.4, 2.2, 0.5] }} transition={{ duration: isMega ? 1.5 : 1.2, times: [0, 0.1, 0.4, 0.8, 1] }} className="absolute left-0 h-12 origin-left z-0" style={{ background: `linear-gradient(90deg, ${themeColors.mid} 0%, ${themeColors.outer} 60%, transparent 100%)`, filter: 'blur(6px)', borderRadius: '100px' }} />
                <motion.div initial={{ width: 0, opacity: 0, scaleY: 0.5 }} animate={{ width: [0, isMega ? 750 : 600, isMega ? 550 : 450, isMega ? 800 : 650, 0], opacity: [0, 0.8, 0.5, 0.9, 0], scaleY: [0.5, 2.8, 2.0, 4.0, 0.5] }} transition={{ duration: isMega ? 1.5 : 1.2, times: [0, 0.1, 0.4, 0.8, 1] }} className="absolute left-0 h-24 origin-left z-[-1]" style={{ background: `linear-gradient(90deg, ${themeColors.glow} 0%, ${themeColors.outer} 70%, transparent 100%)`, filter: 'blur(16px)', borderRadius: '200px' }} />
                {embers.map((ember) => (
                  <motion.div key={ember.id} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: ember.distance * Math.cos(ember.angle * Math.PI / 180), y: ember.distance * Math.sin(ember.angle * Math.PI / 180), opacity: 0, scale: 0 }} transition={{ duration: ember.duration, delay: ember.delay, ease: "easeOut" }} className="absolute left-0 z-20 rounded-full" style={{ width: ember.size, height: ember.size, backgroundColor: ember.color, boxShadow: `0 0 10px ${ember.color}, 0 0 20px ${themeColors.glow}` }} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
