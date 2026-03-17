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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">
        {isEditing ? 'Edit Article' : 'Create New Article'}
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="Enter article title"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
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

        <div className="form-group">
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
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

      <div className="form-group">
        <label htmlFor="thumbnail" className="block text-sm font-semibold text-gray-700 mb-2">
          Thumbnail Image
        </label>
        <div className="space-y-2">
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-dark"
          />
          {thumbnailPreview && (
            <div className="mt-2">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-32 w-auto object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
          Or Image URL (if not uploading)
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

      <div className="form-group">
        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-t-lg border border-b-0 border-gray-300">
          <button type="button" onClick={() => insertHtml('<b>', '</b>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Bold"><b>B</b></button>
          <button type="button" onClick={() => insertHtml('<i>', '</i>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Italic"><i>I</i></button>
          <button type="button" onClick={() => insertHtml('<u>', '</u>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Underline"><u>U</u></button>
          <button type="button" onClick={() => insertHtml('<s>', '</s>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Strikethrough"><s>S</s></button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button type="button" onClick={() => insertHtml('<h2>', '</h2>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Heading 2">H2</button>
          <button type="button" onClick={() => insertHtml('<h3>', '</h3>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Heading 3">H3</button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button type="button" onClick={() => insertHtml('<ul>\n  <li>', '</li>\n</ul>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Bullet List">• List</button>
          <button type="button" onClick={() => insertHtml('<ol>\n  <li>', '</li>\n</ol>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Numbered List">1. List</button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button type="button" onClick={() => insertHtml('<p align="center">', '</p>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Center Align">⫸ Center</button>
          <button type="button" onClick={() => insertHtml('<blockquote>', '</blockquote>')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200" title="Quote">❝ Quote</button>
        </div>
        
        <textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-field min-h-[400px] resize-vertical font-mono text-sm border-t-0 rounded-t-none"
          placeholder="Write your article content here... Select text and click a formatting button above, or type HTML tags directly."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Select text and click a button above to format it. You can also type HTML tags directly.
        </p>
      </div>

      <div className="form-group">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trending}
            onChange={(e) => setTrending(e.target.checked)}
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm font-semibold text-gray-700">Mark as Trending</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : isEditing ? 'Update Article' : 'Create Article'}
        </button>
        
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-6 py-3"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
