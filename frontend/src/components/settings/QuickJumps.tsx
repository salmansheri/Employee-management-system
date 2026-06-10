import { User, Lock, Palette } from 'lucide-react';

export function QuickJumps() {
  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-subtext1">Quick Jumps</h3>
      <nav className="space-y-1">
        <a 
          href="#profile" 
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-subtext0 hover:text-text hover:bg-surface0/55 transition-all"
        >
          <User className="h-4 w-4 text-mauve" />
          Profile Information
        </a>
        <a 
          href="#security" 
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-subtext0 hover:text-text hover:bg-surface0/55 transition-all"
        >
          <Lock className="h-4 w-4 text-blue" />
          Security & Password
        </a>
        <a 
          href="#appearance" 
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-subtext0 hover:text-text hover:bg-surface0/55 transition-all"
        >
          <Palette className="h-4 w-4 text-green" />
          Theme & Appearance
        </a>
      </nav>
    </div>
  );
}
