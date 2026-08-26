import { BrowserRouter, Routes, Route } from 'react-router';
import { useEffect, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { SongPlayer } from './components/layout/SongPlayer';
import { Charizard } from './components/ui/Charizard';
import { FontProvider } from './context/FontContext';
import { AuthProfileProvider } from './context/AuthProfileContext';
import { FontChangerModal } from './components/ui/FontChangerModal';
import { ProfileModal } from './components/ui/ProfileModal';
import { AdminLoginModal } from './components/ui/AdminLoginModal';

import { Home } from './pages/Home';
import { Enter } from './pages/Enter';
import { PublishMacro } from './pages/PublishMacro';
import { Macros } from './pages/Macros';
import { ViewMacro } from './pages/ViewMacro';
import { Profile } from './pages/Profile';

export default function App() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <FontProvider>
      <AuthProfileProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-cb-bg flex flex-col relative text-cb-text">
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar setProfileOpen={setProfileOpen} setAdminOpen={setAdminOpen} />
              <main className="flex-1 flex flex-col">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/enter" element={<Enter />} />
                  <Route path="/macros" element={<Macros />} />
                  <Route path="/macro/:id" element={<ViewMacro />} />
                  <Route path="/publish" element={<PublishMacro />} />
                  <Route path="/creator/:name" element={<Profile />} />
                </Routes>
              </main>
              <SongPlayer />
              <Charizard />
              <FontChangerModal />
              <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
              <AdminLoginModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
            </div>
          </div>
        </BrowserRouter>
      </AuthProfileProvider>
    </FontProvider>
  );
}
