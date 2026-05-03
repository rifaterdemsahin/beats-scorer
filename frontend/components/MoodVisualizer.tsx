import React from 'react';
import { Heart, Zap, Music, Clock, Drum } from 'lucide-react';

interface MoodData {
  valence: number;      // 0.0 - 1.0 (sad to happy)
  arousal: number;      // 0.0 - 1.0 (calm to energetic)
  key: string;
  bpm: number;
  instrumentation: string[];
}

interface MoodVisualizerProps {
  mood: MoodData | null;
  isLoading?: boolean;
}

const MoodVisualizer: React.FC<MoodVisualizerProps> = ({ mood, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-white/10 rounded w-1/3" />
          <div className="h-40 bg-white/5 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-white/5 rounded-lg" />
            <div className="h-16 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!mood) {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-center text-white/40">
        <span className="text-sm">Musical metadata will appear after generation</span>
      </div>
    );
  }

  const valencePercent = Math.round(mood.valence * 100);
  const arousalPercent = Math.round(mood.arousal * 100);

  // Calculate position on the 2D plane (valence = x, arousal = y)
  const dotX = mood.valence * 100;
  const dotY = (1 - mood.arousal) * 100; // Invert Y so high arousal is at top

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Music className="w-5 h-5 text-emerald-400" />
        Musical Metadata
      </h3>

      {/* Valence / Arousal 2D Plane */}
      <div className="space-y-2">
        <label className="text-sm text-white/60">Mood Space (Valence × Arousal)</label>
        <div className="relative w-full aspect-square max-h-48 bg-white/5 rounded-lg border border-white/10">
          {/* Grid lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-white/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px bg-white/10" />
          </div>
          
          {/* Labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40">Energetic</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40">Calm</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/40">Sad</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/40">Happy</span>

          {/* Mood Dot */}
          <div
            className="absolute w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 border-2 border-white/20 transition-all duration-500"
            style={{
              left: `calc(${dotX}% - 8px)`,
              top: `calc(${dotY}% - 8px)`,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Valence */}
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-white/70">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium">Valence</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${valencePercent}%` }}
            />
          </div>
          <span className="text-xs text-white/40">{valencePercent}% positive</span>
        </div>

        {/* Arousal */}
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-white/70">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Arousal</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${arousalPercent}%` }}
            />
          </div>
          <span className="text-xs text-white/40">{arousalPercent}% energetic</span>
        </div>

        {/* Key */}
        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-white/70">
            <Music className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium">Key</span>
          </div>
          <span className="text-xl font-bold text-white">{mood.key}</span>
        </div>

        {/* BPM */}
        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-white/70">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">BPM</span>
          </div>
          <span className="text-xl font-bold text-white">{mood.bpm}</span>
        </div>
      </div>

      {/* Instrumentation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white/70">
          <Drum className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium">Instrumentation</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {mood.instrumentation.map((instrument, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/10"
            >
              {instrument}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodVisualizer;
