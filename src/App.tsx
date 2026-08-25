import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { SongPlayer } from './components/layout/SongPlayer';
import { Charizard } from './components/ui/Charizard';

import { Home } from './pages/Home';
import { Enter } from './pages/Enter';
import { PublishMacro } from './pages/PublishMacro';
import { Macros } from './pages/Macros';
import { ViewMacro } from './pages/ViewMacro';
import { Profile } from './pages/Profile';
import { Crew } from './pages/Crew';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cb-bg flex flex-col relative text-cb-text">
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/enter" element={<Enter />} />
              <Route path="/macros" element={<Macros />} />
              <Route path="/macro/:id" element={<ViewMacro />} />
              <Route path="/publish" element={<PublishMacro />} />
              <Route path="/creator/:name" element={<Profile />} />
              <Route path="/crew" element={<Crew />} />
            </Routes>
          </main>
          <SongPlayer />
          <Charizard />
        </div>
      </div>
    </BrowserRouter>
  );
}
