'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Article, Comment } from '@/types';
import { formatDate, getOptimizedImageUrl, getSiteUrl, shouldBypassNextImageOptimization } from '@/lib/utils';

interface ArticleContentProps {
  article: Article;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const [likes, setLikes] = useState(article.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(article.comments || []);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // KHQR donation modal
  const [showKhqr, setShowKhqr] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!showKhqr) return;
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setShowKhqr(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showKhqr]);
  const heroImage = getOptimizedImageUrl(article.image, {
    width: 1400,
    height: 900,
    crop: 'limit',
  });
  const unoptimizedHero = shouldBypassNextImageOptimization(heroImage);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await fetch(`/api/articles/${article._id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  const handleShare = (platform: string) => {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : getSiteUrl();
    const cleanUrl = `${baseUrl}/a/${article.publicId || article._id}`;
    const url = encodeURIComponent(cleanUrl);
    const title = encodeURIComponent(article.title);
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    };
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/articles/${article._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: commentAuthor.trim() || 'Anonymous',
          text: commentText.trim(),
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setCommentAuthor('');
        setCommentText('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <>
      {/* KHQR Donation Modal */}
      {showKhqr && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowKhqr(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl flex flex-col items-center p-6 sm:p-8 max-w-[340px] w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'khqrIn 0.35s cubic-bezier(.22,1,.36,1) both' }}
          >
            {/* Countdown badge */}
            <div
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#e53e3e,#c53030)' }}
            >
              {countdown}
            </div>

            {/* Header */}
            <div className="mb-2 text-center">
              {/* Donate icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg,#fff0f0,#ffe0e0)' }}>
                <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.593c-.425-.232-8.5-5.01-8.5-10.593 0-3.038 2.462-5.5 5.5-5.5 1.743 0 3.296.82 4.312 2.102C14.316 6.32 15.869 5.5 17.612 5.5c3.038 0 5.5 2.462 5.5 5.5-.001 5.583-8.076 10.361-8.5 10.593a.992.992 0 0 1-1.112 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                ឧបត្ថម្ភដើម្បីរក្សាវែបសាយ
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5 leading-relaxed" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                អ្នកអាចឧបត្ថម្ភថ្លៃ Hosting និង Domain។<br />
                រាល់ការចូលរួមរបស់លោកអ្នក ជួយឱ្យពួកយើងអាចបន្តដំណើរការបាន។
              </p>
            </div>

            {/* QR Code */}
            <div className="relative w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] my-4 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-md">
              <Image
                src="/uploads/images/khqrcode.jpg"
                alt="KHQR Donation QR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>

            {/* Skip button */}
            <button
              onClick={() => setShowKhqr(false)}
              className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-red-400 hover:text-red-500 transition-all"
              style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}
            >
              រំលង ({countdown}វិ)
            </button>
          </div>
        </div>
      )}


      <article className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-full">
        {/* Article Header */}
        <div className="p-5 sm:p-7 md:p-10 pb-0">
          {/* Category + Meta row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            {article.category && (
              <span className="category-badge">{article.category}</span>
            )}
            <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(article.createdAt || article.date)}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {Intl.NumberFormat('en-US', { notation: 'compact' }).format(article.views || 0)} views
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[1.4rem] sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-tight" style={{ lineHeight: '1.25' }}>
            {article.title}
          </h1>
        </div>

        {/* Hero Image */}
        {article.image && (
          <div className="relative w-full h-[220px] sm:h-[340px] md:h-[460px] mt-2">
            <Image
              src={heroImage || 'https://placehold.co/800x400/cccccc/ffffff?text=No+Image'}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              unoptimized={unoptimizedHero}
            />
            {/* Subtle bottom gradient for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>
        )}

        {/* Article Body */}
        <div className="p-5 sm:p-7 md:p-10 pt-4 sm:pt-6">
          <div
            className="article-body-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Divider */}
          <div className="border-t border-gray-100 mt-8 pt-6">
            {/* Like + Share */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Like button */}
              <button
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0
                ${hasLiked
                    ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                    : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
              >
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${hasLiked ? 'fill-green-500' : 'fill-white'}`} viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {hasLiked ? 'Liked!' : 'Like'} ({likes})
              </button>

              {/* Share buttons */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs sm:text-sm font-medium">Share:</span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-1.5 bg-[#1877f2] hover:bg-[#1565c0] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                  <span className="hidden xs:inline">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
                  <span className="hidden xs:inline">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-100 px-5 sm:px-7 md:px-10 py-6 sm:py-8">
          <div className="section-title-bar mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Comment List */}
          <div className="space-y-3 sm:space-y-4 max-h-[360px] overflow-y-auto pr-1 mb-6 sm:mb-8">
            {comments.length === 0 ? (
              <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-xl">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-400 text-sm sm:text-base">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <div
                  key={comment._id}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 sm:p-4 hover:bg-gray-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xs sm:text-sm">
                        {comment.author?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{comment.author || 'Anonymous'}</p>
                      <p className="text-gray-400 text-[11px] sm:text-xs">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-[0.95rem] leading-relaxed pl-9 sm:pl-10">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Leave a Comment</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="author" className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1.5">
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="author"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="input-field text-sm sm:text-base"
                  placeholder="Your name"
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="comment" className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1.5">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field min-h-[90px] sm:min-h-[110px] resize-vertical text-sm sm:text-base"
                  placeholder="Write your comment..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base shadow-sm hover:shadow-md"
              >
                {submittingComment ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Posting...
                  </span>
                ) : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </article>
    </>
  );
}
