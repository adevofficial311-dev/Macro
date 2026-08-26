import { Link, useLocation } from 'react-router';
import { Menu, X, PlusCircle, Type, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useFont } from '../../context/FontContext';

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal, currentPreset } = useFont();
  
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Macros Hub', path: '/macros' },
  ];

  return (
    <nav className="h-[72px] bg-cb-bg/90 backdrop-blur-md border-b border-cb-border flex items-center px-3 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-50 transition-all">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2">
        {/* Brand Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-display font-black tracking-tight flex items-center gap-1 group shrink-0">
          <span className="text-white">COKE</span>
          <span className="text-cb-yellow">BOYS</span>
        </Link>
        
        {/* Navigation Links & Font Tab */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 bg-cb-surface/60 border border-cb-border rounded-xl p-1.5 backdrop-blur-sm">
          {links.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs lg:text-sm font-medium px-3.5 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-cb-yellow text-black font-semibold shadow-sm' 
                    : 'text-cb-text-muted hover:text-white hover:bg-cb-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Font Changer Navigation Tab Button */}
          <button
            onClick={openModal}
            className="text-xs lg:text-sm font-medium px-3.5 py-2 rounded-lg text-cb-text-muted hover:text-cb-yellow hover:bg-cb-surface transition-all flex items-center gap-1.5 border border-transparent hover:border-cb-border cursor-pointer group"
            title="Customize Website Font"
          >
            <Type size={14} className="text-cb-yellow group-hover:scale-110 transition-transform" />
            <span>Fonts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cb-surface border border-cb-border/80 text-cb-yellow font-mono hidden xl:inline-block">
              {currentPreset.name.split(' ')[0]}
            </span>
          </button>
        </div>

        {/* CTA Button & Quick Font Changer */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <button
            onClick={openModal}
            className="bg-cb-surface hover:bg-cb-surface-hover border border-cb-border hover:border-cb-yellow/50 text-cb-text-muted hover:text-white inline-flex items-center justify-center font-bold transition-all rounded-lg h-10 px-3 text-xs gap-1.5 cursor-pointer active:scale-95"
            title="Open Font Customizer"
          >
            <Sparkles size={14} className="text-cb-yellow" />
            <span className="hidden lg:inline">Style</span>
          </button>

          <Link 
            to="/publish"
            className="bg-cb-red hover:bg-cb-red-hover text-white shadow-md shadow-cb-red/20 inline-flex items-center justify-center font-bold transition-all rounded-lg h-10 px-4 text-xs lg:text-sm gap-2 active:scale-95 whitespace-nowrap"
          >
            <PlusCircle size={15} />
            <span>Publish Macro</span>
          </Link>
        </div>

        {/* Mobile quick controls & menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={openModal}
            className="p-2 rounded-lg bg-cb-surface border border-cb-border text-cb-yellow hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
            aria-label="Change Font"
          >
            <Type size={16} />
            <span className="text-[11px]">Fonts</span>
          </button>

          <button 
            className="p-2 rounded-lg bg-cb-surface border border-cb-border text-cb-text-muted hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-cb-bg/95 backdrop-blur-xl border-b border-cb-border md:hidden p-5 flex flex-col gap-3 shadow-2xl">
          {links.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-medium px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-cb-yellow text-black font-bold' 
                    : 'text-cb-text-muted hover:text-white hover:bg-cb-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <button
            onClick={() => {
              setMobileOpen(false);
              openModal();
            }}
            className="text-base font-medium px-4 py-3 rounded-lg bg-cb-surface border border-cb-border text-left text-cb-yellow flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2 font-bold">
              <Type size={18} />
              <span>Change Font Preset</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cb-bg text-cb-text-muted font-mono">
              {currentPreset.name}
            </span>
          </button>

          <Link 
            to="/publish"
            onClick={() => setMobileOpen(false)}
            className="bg-cb-red hover:bg-cb-red-hover text-white shadow-md shadow-cb-red/20 w-full inline-flex items-center justify-center font-bold transition-all rounded-lg h-12 text-base mt-2 gap-2"
          >
            <PlusCircle size={18} />
            <span>Publish Macro</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
