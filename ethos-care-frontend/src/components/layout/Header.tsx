import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Empty left space for flexibility */}
        <div className="flex-1"></div>

        {/* Right side actions */}
        <div className="flex flex-row-reverse items-center justify-start gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors relative group">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </button>
          
          <button className="flex items-center gap-3 pr-4 border-r border-outline-variant/20 hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-on-surface font-headline">
                أحمد محمد
              </span>
              <span className="text-[10px] text-primary tracking-wide">
                مسؤول النظام
              </span>
            </div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGNatPgKmmKSxxoK-rAzIQjH3OeQIP-76aPv3Q_2Er6Sp7wOcUflIgH2lP3uLVaSUD4BzVSpwsrB3Ks5s0ZavfcvavDNA7BPPDhyVd6SW0sLPovulk9jyTcG9TUpA2CbECCWQAuzud9miVdRRafwjoS0W5i652xs33CD6bAMkbH_J9tCoIBauea95M3bx_O_UVEGmJqiFatrqWcp_g9KoQ1MinrVzf3TI1ilQB39lh0enyc6gETzWHM_wyqJzd5iGzg83RBpuNVNY"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/10"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
