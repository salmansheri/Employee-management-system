import { useUIStore } from '../../store/useUIStore';
import { Palette, Sun, Moon } from 'lucide-react';

export function AppearanceCard() {
  const { theme, setTheme } = useUIStore();

  return (
    <section id="appearance" className="rounded-2xl glass-panel p-6 space-y-6 scroll-mt-6">
      <div className="flex items-center gap-3 pb-4 border-b border-surface0/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-text">Theme & Appearance</h3>
          <p className="text-xs text-subtext0 mt-0.5">Customize your color preferences and modes</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface0/40 border border-surface0">
          <div>
            <h4 className="text-sm font-semibold text-text">Visual Mode</h4>
            <p className="text-xs text-subtext0 mt-0.5">Switch between light (Latte) and dark (Mocha) modes.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 rounded-lg py-2 px-4 text-xs font-semibold border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-mauve text-crust border-mauve shadow-md'
                  : 'bg-surface0 text-subtext0 border-surface1 hover:text-text'
              }`}
            >
              <Sun className="h-4 w-4" />
              Light Mode
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 rounded-lg py-2 px-4 text-xs font-semibold border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-mauve text-crust border-mauve shadow-md'
                  : 'bg-surface0 text-subtext0 border-surface1 hover:text-text'
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark Mode
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
