import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const LeaveReviewModal: React.FC = () => {
  const { reviewModalData, setReviewModalData, addReview } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  if (!reviewModalData || !reviewModalData.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview({
      targetId: reviewModalData.targetId,
      rating,
      comment: comment.trim() || 'Prompt, professional, and courteous work experience. Recommended!',
      jobTitle: reviewModalData.jobTitle,
    });
  };

  const handleSkip = () => {
    setReviewModalData(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              Job Completed
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Rate & Review {reviewModalData.targetName}
            </h3>
            <p className="text-xs text-slate-500">
              For: {reviewModalData.jobTitle}
            </p>
          </div>

          <button
            onClick={handleSkip}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="text-center space-y-2 py-2">
            <label className="text-xs font-semibold text-slate-700 block">
              How would you rate the experience?
            </label>

            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-600 block">
              {rating === 5
                ? '5.0 — Excellent, highly recommend!'
                : rating === 4
                ? '4.0 — Very good work'
                : rating === 3
                ? '3.0 — Average'
                : 'Needs improvement'}
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Feedback / Review Notes
            </label>
            <textarea
              rows={3}
              placeholder="Share honest feedback about punctuality, technical skill, quality, or site communication..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Submit Star Review
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
