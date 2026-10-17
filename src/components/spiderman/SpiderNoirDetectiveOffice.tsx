import React, { useState } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { Flame, FileText, Search } from 'lucide-react';

interface MobCaseFile {
  id: string;
  target: string;
  alias: string;
  status: string;
  notes: string;
}

export const SpiderNoirDetectiveOffice: React.FC = () => {
  const [activeCase, setActiveCase] = useState<string>('goblin');
  const [matchLit, setMatchLit] = useState(false);
  const [typewriterText, setTypewriterText] = useState(
    'NEW YORK CITY, 1933. The wind smells of cheap cigars and spent gunpowder. The Goblin runs the circus, but the shadow is coming for him.'
  );

  const mobFiles: MobCaseFile[] = [
    {
      id: 'goblin',
      target: 'Norman Osborn',
      alias: 'The Goblin',
      status: 'CRIME BOSS // HARLEM PACKING HOUSE',
      notes: 'Controls city hall and corrupt judges. Keeps an army of circus freak enforcers. Weakness: Arrogance and chemical dependency.',
    },
    {
      id: 'vulture',
      target: 'Adrian Toomes',
      alias: 'The Vulture',
      status: 'CANNIBALISTIC HITMAN',
      notes: 'Osborn\'s most ruthless executioner. Feeds on those who fail the boss. Killed Uncle Ben. Personal vendetta confirmed.',
    },
    {
      id: 'felicia',
      target: 'Felicia Hardy',
      alias: 'The Black Cat',
      status: 'SPEAKEASY OWNER // THE BLACK CAT CLUB',
      notes: 'Knows every rumor between Wall Street and 125th Street. Dangerous, charming, untrustworthy.',
    },
  ];

  const lightMatch = () => {
    soundEngine.playNoirMatchStrike();
    setMatchLit(true);
    setTimeout(() => setMatchLit(false), 3000);
  };

  const logEvidence = () => {
    soundEngine.playNoirTypewriter();
    setTypewriterText(
      `LOG ENTRY: ${new Date().toLocaleTimeString()} — Confirmed sighting at Lower East Side pier. Loaded six rounds into the .38. Justice has no bedtime.`
    );
  };

  const selectedFile = mobFiles.find((f) => f.id === activeCase) || mobFiles[0];

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#08080A] overflow-hidden shadow-2xl noir-grain">
      {/* Top Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                SPIDER-MAN NOIR: 1933 CRIME SYNDICATE DESK
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                HARLEM &amp; LOWER EAST SIDE // E-90214
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Chiaroscuro detective dossiers. Strike a match in the darkness to expose syndicate secrets.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={lightMatch}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition flex items-center space-x-1.5 ${
              matchLit
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                : 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{matchLit ? 'MATCH BURNING...' : 'STRIKE MATCH'}</span>
          </button>
        </div>
      </div>

      {/* Main Detective Desk Layout */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0B0B0E]">
        {/* Dossier Tabs (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
            CONFIDENTIAL MOB DOSSIERS:
          </span>
          {mobFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => {
                soundEngine.playNoirTypewriter();
                setActiveCase(file.id);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition ${
                activeCase === file.id
                  ? 'bg-white/15 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-black/50 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-xs font-mono text-amber-400 font-bold">{file.alias}</div>
              <div className="text-sm font-sans font-extrabold text-white">{file.target}</div>
              <div className="text-[10px] font-mono text-zinc-500 truncate mt-1">{file.status}</div>
            </button>
          ))}
        </div>

        {/* Case File Detail & Typewriter (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-6">
          <div className="p-5 bg-black/60 rounded-2xl border border-white/10 relative">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
              TARGET INVESTIGATION:
            </span>
            <h3 className="font-comic text-3xl text-white tracking-wide">{selectedFile.alias}</h3>
            <p className="text-xs font-mono text-zinc-400 mb-3">{selectedFile.status}</p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-xs text-zinc-300 leading-relaxed">
              {selectedFile.notes}
            </div>
          </div>

          {/* Typewriter Journal */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> UNDERWOOD NO. 5 TYPEWRITER
              </span>
              <button
                onClick={logEvidence}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 transition active:scale-95"
              >
                CLACK NEW ENTRY
              </button>
            </div>
            <p className="font-mono text-xs text-amber-100/90 leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5">
              "{typewriterText}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
