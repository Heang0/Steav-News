'use client';

import { useState, useRef } from 'react';
import { CATEGORIES } from '@/lib/utils';

interface ArticleFormProps {
  article?: Article | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Article {
  _id: string;
  shortId: string;
  title: string;
  image: string;
  date: string;
  content: string;
  createdAt: string;
  trending: boolean;
  likes: number;
  views: number;
  category: string;
  comments: any[];
}

export default function ArticleForm({ article, onSuccess, onCancel }: ArticleFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(article?.content || '');
  const [title, setTitle] = useState(article?.title || '');
  const [date, setDate] = useState(article?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(article?.category || CATEGORIES[0]);
  const [trending, setTrending] = useState(article?.trending || false);
  const [imageUrl, setImageUrl] = useState(article?.image || '');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = !!article;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('date', date);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('trending', trending.toString());
      formData.append('imageUrl', imageUrl);
      
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const url = isEditing
        ? `/api/admin/articles/${article?._id}`
        : '/api/admin/articles';
      
      const method = isEditing ? 'PUT' : 'POST';

      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(url, {
        method,
        headers: {
          'X-Session-ID': sessionId,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save article');
      }

      setSuccessMessage(isEditing ? 'Article updated successfully!' : 'Article created successfully!');
      
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      } else {
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setContent('');
        setCategory(CATEGORIES[0]);
        setTrending(false);
        setImageUrl('');
        setThumbnail(null);
        setThumbnailPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const insertHtml = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || 'text';
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const ToolbarButton = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {children}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Article' : 'Create New Article'}
        </h3>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field text-lg"
          placeholder="Enter article title..."
          required
        />
      </div>

      {/* Date & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Thumbnail Image
        </label>
        <div className="flex items-start gap-4">
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </label>
          
          {thumbnailPreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnail(null);
                  setThumbnailPreview(null);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700">
          Or Use Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="input-field"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Content <span className="text-red-500">*</span>
        </label>
        
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-t-xl border border-gray-200 border-b-0">
          <ToolbarButton onClick={() => insertHtml('<b>', '</b>')} title="Bold">
            <span className="font-bold text-base">B</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHtml('<i>', '</i>')} title="Italic">
            <span className="italic text-base">I</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHtml('<u>', '</u>')} title="Underline">
            <span className="underline text-base">U</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHtml('<s>', '</s>')} title="Strikethrough">
            <span className="line-through text-base">S</span>
          </ToolbarButton>
          
          <div className="w-px h-9 bg-gray-300 mx-1 self-center"></div>
          
          <ToolbarButton onClick={() => insertHtml('<h2>', '</h2>')} title="Heading 2">
            <span className="font-bold text-sm">H2</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHtml('<h3>', '</h3>')} title="Heading 3">
            <span className="font-bold text-xs">H3</span>
          </ToolbarButton>
          
          <div className="w-px h-9 bg-gray-300 mx-1 self-center"></div>
          
          <ToolbarButton onClick={() => insertHtml('<ul>\n  <li>', '</li>\n</ul>')} title="Bullet List">
            <span className="text-sm">•</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHtml('<ol>\n  <li>', '</li>\n</ol>')} title="Numbered List">
            <span className="text-sm">1.</span>
          </ToolbarButton>
          
          <div className="w-px h-9 bg-gray-300 mx-1 self-center"></div>
          
          <ToolbarButton onClick={() => insertHtml('<p align="center">', '</p>')} title="Center Align">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M4 18h16" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHtml('<blockquote>', '</blockquote>')} title="Quote">
            <span className="text-xs">❝</span>
          </ToolbarButton>
        </div>
        
        <textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-field min-h-[400px] resize-vertical font-sans text-base leading-relaxed border-t-0 rounded-t-none focus:ring-2 focus:ring-primary/20"
          placeholder="Write your article content here... Select text and click a formatting button above, or type HTML tags directly."
          required
        />
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select text and click a button above to format it instantly.
        </p>
      </div>

      {/* Trending Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
          </svg>
          <div>
            <label className="text-sm font-semibold text-gray-700 cursor-pointer">
              Mark as Trending
            </label>
            <p className="text-xs text-gray-500">Show this article in the trending section</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={trending}
            onChange={(e) => setTrending(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            isEditing ? 'Update Article' : 'Create Article'
          )}
        </button>
      </div>
    </form>
  );
}
