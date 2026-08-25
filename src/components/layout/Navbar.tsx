import { Link, useLocation } from 'react-router';
import { Menu, X, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Macros Hub', path: '/macros' },
    { name: 'Official Crew', path: '/crew' },
  ];

  return (
    <nav className="h-[72px] bg-cb-bg/90 backdrop-blur-md border-b border-cb-border flex items-center px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-50 transition-all">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-display font-black tracking-tight flex items-center gap-1 group">
          <span className="text-white">COKE</span>
          <span className="text-cb-yellow">BOYS</span>
          <span className="w-2 h-2 rounded-full bg-cb-red ml-1 shadow-[0_0_8px_#E53935]" />
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 bg-cb-surface/60 border border-cb-border rounded-xl p-1.5 backdrop-blur-sm">
          {links.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-cb-yellow text-black font-semibold shadow-sm' 
                    : 'text-cb-text-muted hover:text-white hover:bg-cb-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/publish"
            className="bg-cb-red hover:bg-cb-red-hover text-white shadow-md shadow-cb-red/20 inline-flex items-center justify-center font-bold transition-all rounded-lg h-10 px-5 text-sm gap-2 active:scale-95"
          >
            <PlusCircle size={16} />
            <span>Publish Macro</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-lg bg-cb-surface border border-cb-border text-cb-text-muted hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
