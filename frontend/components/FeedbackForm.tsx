import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Volume2, Gauge, Music, Clock, Wand2 } from 'lucide-react';

interface FeedbackFormProps {
  onSubmitFeedback: (feedback: FeedbackData) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface FeedbackData {
  rating: 'positive' | 'negative' | null;
  issues: string[];
  customFeedback: string;
}

const FEEDBACK_OPTIONS = [
  { id: 'too_loud', label: 'Too loud', icon: Volume2 },
  { id: 'too_fast', label: 'Too fast', icon: Gauge },
  { id: 'too_slow', label: 'Too slow', icon: Clock },
  { id: 'wrong_mood', label: 'Wrong mood', icon: Music },
  { id: 'wrong_instruments', label: 'Wrong instruments', icon: Wand2 },
];

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmitFeedback, isLoading = false, disabled = false }) => {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [customFeedback, setCustomFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleIssue = (issueId: string) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSubmit = () => {
    if (disabled) return;
    onSubmitFeedback({
      rating,
      issues: selectedIssues,
      customFeedback: customFeedback.trim(),
    });
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setRating(null);
    setSelectedIssues([]);
    setCustomFeedback('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <ThumbsUp className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-white font-medium">Thank you for your feedback!</h4>
          <p className="text-white/50 text-sm mt-1">Your input helps us improve Lyra-Beat.</p>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Submit another feedback
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-emerald-400" />
        Feedback
      </h3>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-sm text-white/60">How did it sound?</label>
        <div className="flex gap-3">
          <button
            onClick={() => setRating('positive')}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
              rating === 'positive'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">Good</span>
          </button>
          <button
            onClick={() => setRating('negative')}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
              rating === 'negative'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm">Needs work</span>
          </button>
        </div>
      </div>

      {/* Issue Selection */}
      <div className="space-y-2">
        <label className="text-sm text-white/60">What could be improved?</label>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_OPTIONS.map(option => {
            const Icon = option.icon;
            const isSelected = selectedIssues.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleIssue(option.id)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Feedback */}
      <div className="space-y-2">
        <label className="text-sm text-white/60">Additional comments</label>
        <textarea
          value={customFeedback}
          onChange={e => setCustomFeedback(e.target.value)}
          disabled={disabled}
          placeholder="Describe what you'd like to change..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-40"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={disabled || (!rating && selectedIssues.length === 0 && !customFeedback.trim()) || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Feedback
          </>
        )}
      </button>
    </div>
  );
};

export default FeedbackForm;
