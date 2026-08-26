import { Link } from 'react-router';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function Enter() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cb-surface border border-cb-border mb-4">
          <span className="text-xs font-bold text-cb-yellow uppercase tracking-wider">CokeBoys Cinematic Showcase</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tight mb-2 break-words">
          COKEBOYS <span className="text-cb-yellow">CLIENT</span>
        </h1>
        <p className="text-xs sm:text-base md:text-lg font-medium text-cb-text-muted break-words">
          Macro Guide • Combo Mechanics • Best Features
        </p>
      </div>

      <div id="video-showcase-guide" className="w-full max-w-4xl aspect-video bg-cb-surface rounded-2xl border border-cb-border overflow-hidden shadow-2xl mb-8 relative group">
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/VnXCxwjc_o0?autoplay=1&mute=1&loop=1" 
          title="CokeBoys Client Showcase" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="/macros"
          className="bg-cb-yellow hover:bg-cb-yellow-hover text-black font-extrabold text-base transition-all rounded-xl h-14 px-10 inline-flex items-center justify-center gap-2 shadow-lg shadow-cb-yellow/20 active:scale-95 uppercase tracking-wide"
        >
          <span>Enter Macro Hub</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
