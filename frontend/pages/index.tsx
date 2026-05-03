import React, { useState } from 'react';
import axios from 'axios';
import { Music, Wand2, Loader2, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';
import MoodVisualizer, { MoodData } from '../components/MoodVisualizer';
import FeedbackForm, { FeedbackData } from '../components/FeedbackForm';

interface GenerationResult {
  audioUrl: string;
  mood: MoodData;
  rationale: string;
}

export default function Home() {
  const [sentence, setSentence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleGenerate = async () => {
    if (!sentence.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setStatus('Analyzing sentiment...');

    try {
      // Simulate progressive status updates
      const statusTimeout1 = setTimeout(() => setStatus('Mapping to musical parameters...'), 1500);
      const statusTimeout2 = setTimeout(() => setStatus('Composing audio...'), 3000);
      const statusTimeout3 = setTimeout(() => setStatus('Finalizing...'), 5000);

      // Call backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/review`,
        {
          feedback: feedback.comment || feedback.rating,
          current_metadata: result?.mood,
        },
        { timeout: 10000 }
      );

      clearTimeout(statusTimeout1);
      clearTimeout(statusTimeout2);
      clearTimeout(statusTimeout3);

      if (response.data) {
        const metadata = response.data.metadata || {};
        setResult({
          audioUrl: response.data.audio_url || '',
          mood: {
            valence: metadata.valence ?? 0.5,
            arousal: metadata.arousal ?? 0.5,
            key: metadata.key || 'C Major',
            bpm: metadata.bpm || 120,
            instrumentation: metadata.instrumentation || ['piano', 'strings'],
          },
          rationale: response.data.musical_rationale || '',
        });
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate music. Please try again.'
      );
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/feedback`,
        {
          sentence,
          feedback,
        },
        { timeout: 10000 }
      );
    } catch (err) {
      console.error('Feedback submission error:', err);
      // Silently fail - feedback is non-critical
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Music className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Lyra-Beat</h1>
              <p className="text-xs text-white/40">Text-to-Music Generation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
              Beta
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Powered by AI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Turn your words<br />into music
          </h2>
          <p className="text-white/50 text-lg">
            Type a sentence, and Lyra-Beat will compose a unique musical piece reflecting its sentiment and meaning.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <textarea
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              placeholder="Enter a sentence or phrase... (e.g., 'A calm morning by the ocean')"
              rows={3}
              disabled={isGenerating}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 text-base resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 transition-all"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleGenerate();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-white/20">
              {sentence.length} chars
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !sentence.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-semibold text-lg rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {status || 'Generating...'}
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Music
              </>
            )}
          </button>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-white/20">
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/40 text-[10px] font-mono">Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/40 text-[10px] font-mono">Enter</kbd> to generate
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-rose-400 text-sm font-medium">Generation failed</p>
              <p className="text-rose-400/70 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400/50 hover:text-rose-400 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {(result || isGenerating) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Left Column: Audio + Rationale */}
            <div className="space-y-6">
              {/* Audio Player */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Audio</h3>
                <AudioPlayer
                  audioUrl={result?.audioUrl || null}
                  isLoading={isGenerating}
                />
              </div>

              {/* Rationale */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  Musical Rationale
                </h3>
                {isGenerating ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                    <div className="h-4 bg-white/10 rounded w-4/6" />
                  </div>
                ) : result?.rationale ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.rationale}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right Column: Mood + Feedback */}
            <div className="space-y-6">
              {/* Mood Visualizer */}
              <MoodVisualizer
                mood={result?.mood || null}
                isLoading={isGenerating}
              />

              {/* Feedback Form */}
              <FeedbackForm
                onSubmitFeedback={handleFeedbackSubmit}
                disabled={!result || isGenerating}
                isLoading={false}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            Lyra-Beat — AI-powered text-to-music generation
          </p>
          <p className="text-white/20 text-xs">
            Built with Next.js, Tailwind CSS, and Python
          </p>
        </div>
      </footer>
    </div>
  );
}
