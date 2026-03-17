'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Article, Comment } from '@/types';
import { formatDate } from '@/lib/utils';

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

  const handleLike = async () => {
    if (hasLiked) return;

    try {
      const res = await fetch(`/api/articles/${article._id}/like`, {
        method: 'POST',
      });

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
    // Use clean short URL for sharing
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://steav-news.onrender.com';
    // Always use clean URL format
    const cleanUrl = article.shortId 
      ? `${baseUrl}/a/${article.shortId}`
      : `${baseUrl}/a/${article._id}`;
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="article-detail bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md w-full">
      {/* Article Header */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 text-left leading-tight">
        {article.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-6">
        <p className="italic">
          <span className="font-semibold">Date:</span> {formatDate(article.createdAt || article.date)}
        </p>
        {article.category && (
          <span className="bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            {article.category}
          </span>
        )}
        <span className="flex items-center gap-1">
          <i className="fas fa-eye"></i> {article.views || 0} views
        </span>
      </div>

      {/* Article Image */}
      {article.image && (
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] mb-6 sm:mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image || 'https://placehold.co/800x400/cccccc/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </div>
      )}

      {/* Article Content */}
      <div
        className="article-body-content text-gray-800 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Action Buttons */}
      <div className="article-interaction border-t pt-4 sm:pt-6">
        <div className="action-buttons-group flex flex-wrap justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={handleLike}
            disabled={hasLiked}
            className={`action-button px-4 sm:px-6 py-2.5 sm:py-3 rounded font-semibold transition-all flex items-center gap-2 text-sm sm:text-base
              ${hasLiked 
                ? 'bg-green-500 cursor-default' 
                : 'bg-primary hover:bg-primary-dark hover:-translate-y-0.5'
              } text-white`}
          >
            <i className={`fas fa-heart ${hasLiked ? 'animate-pulse' : ''}`}></i>
            {hasLiked ? 'Liked!' : 'Like'} ({likes})
          </button>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons flex flex-wrap justify-center gap-2 sm:gap-3">
          <span className="text-gray-600 font-semibold self-center text-sm sm:text-base">Share:</span>
          <button
            onClick={() => handleShare('facebook')}
            className="share-button facebook bg-[#3b5998] hover:bg-[#2d4373] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
          >
            <i className="fab fa-facebook-f"></i>
            <span className="hidden xs:inline">Facebook</span>
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="share-button twitter bg-[#1da1f2] hover:bg-[#0c85d0] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
          >
            <i className="fab fa-twitter"></i>
            <span className="hidden xs:inline">Twitter</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section border-t mt-6 sm:mt-8 pt-4 sm:pt-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary text-left mb-4 sm:mb-6 border-b pb-3">
          Comments ({comments.length})
        </h2>

        {/* Comments List */}
        <div id="commentsList" className="max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 mb-6 sm:mb-8">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment: Comment) => (
              <div
                key={comment._id}
                className="comment-item bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
              >
                <div className="comment-meta text-xs sm:text-sm text-gray-600 mb-2">
                  <strong className="text-gray-800">{comment.author}</strong>
                  <span className="mx-2">•</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <div className="comment-content-text text-sm sm:text-base text-gray-800">
                  {comment.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form id="commentForm" onSubmit={handleSubmitComment} className="border-t pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary mb-4 sm:mb-5">
            Leave a Comment
          </h3>
          
          <div className="form-group mb-3 sm:mb-4">
            <label htmlFor="author" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
          
          <div className="form-group mb-3 sm:mb-4">
            <label htmlFor="comment" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field min-h-[80px] sm:min-h-[100px] resize-vertical text-sm sm:text-base"
              placeholder="Write your comment..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="submit-comment-button bg-primary hover:bg-primary-dark text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base w-full sm:w-auto"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
