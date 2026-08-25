import { Shield, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function Crew() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-1 flex flex-col items-center justify-center text-center">
      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cb-surface border border-cb-border mb-6 shadow-sm">
        <Clock size={14} className="text-cb-yellow" />
        <span className="text-xs font-bold text-cb-yellow uppercase tracking-widest">
          Official Crew
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight mb-4">
        Upcoming<span className="text-cb-yellow">....</span>
      </h1>

      {/* Brief Detail */}
      <p className="text-base sm:text-lg text-cb-text-muted max-w-xl mb-10 leading-relaxed">
        The official CokeBoys Crew roster, verified member requirements, and recruitment guidelines are coming soon. Stay tuned for official announcements.
      </p>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
        <Link 
          to="/macros"
          className="w-full sm:w-auto bg-cb-yellow hover:bg-cb-yellow-hover text-black font-extrabold text-sm transition-all rounded-xl h-11 px-6 inline-flex items-center justify-center gap-2 shadow-md shadow-cb-yellow/20 active:scale-95"
        >
          <span>Explore Macros Hub</span>
          <ArrowRight size={16} />
        </Link>
        <Link 
          to="/"
          className="w-full sm:w-auto bg-cb-surface hover:bg-cb-surface-hover text-cb-text-muted hover:text-white border border-cb-border font-semibold text-sm transition-all rounded-xl h-11 px-6 inline-flex items-center justify-center active:scale-95"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
