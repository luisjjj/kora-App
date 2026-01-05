
import React from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="min-h-screen pb-24 flex flex-col max-w-md mx-auto relative bg-[#0a0a0a]">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold italic text-black">K</div>
          <h1 className="text-xl font-bold tracking-tight">Kora</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30">
            <img src="https://picsum.photos/seed/alex/100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeView === item.id ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeView === item.id ? 'bg-emerald-500/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
