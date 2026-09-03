import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950/95">
          {children}
        </main>
      </div>
    </div>
  );
};
