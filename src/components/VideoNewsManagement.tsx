'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, getOptimizedImageUrl } from '@/lib/utils';

export default function VideoNewsManagement() {
  const [videos, setVideos] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [facebookVideoUrl, setFacebookVideoUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [scrapedImageUrl, setScrapedImageUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [authorId, setAuthorId] = useState('');
  const [staffList, setStaffList] = useState<any[]>([]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/articles?limit=1000&onlyVideos=true');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetch('/api/staff')
      .then(r => r.json())
      .then(d => {
        if (d.success) setStaffList(d.data);
      })
      .catch(err => console.error('Failed to fetch staff', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('facebookVideoUrl', facebookVideoUrl);
      formData.append('category', 'វីដេអូ'); // Default category for videos
      formData.append('content', `<p>សូមទស្សនាវីដេអូខាងក្រោម៖</p>`); // Dummy content
      if (image) {
        formData.append('thumbnail', image);
      } else if (scrapedImageUrl) {
        formData.append('imageUrl', scrapedImageUrl);
      }
      if (authorId) {
        formData.append('authorId', authorId);
      }

      const url = editingId ? `/api/admin/articles/${editingId}` : '/api/admin/articles';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'X-Session-ID': sessionId,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setTitle('');
        setFacebookVideoUrl('');
        setImage(null);
        setScrapedImageUrl('');
        setAuthorId('');
        fetchVideos();
      } else {
        setError(data.error || 'Failed to save video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (v: Article) => {
    setEditingId(v._id);
    setTitle(v.title);
    setFacebookVideoUrl(v.facebookVideoUrl || '');
    setImage(null);
    setScrapedImageUrl(v.image || '');
    setAuthorId(v.authorId || '');
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const sessionId = localStorage.getItem('sessionId');
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: { 'X-Session-ID': sessionId || '' },
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading videos...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-primary">▶</span> Video News Management
        </h2>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
              setTitle('');
              setFacebookVideoUrl('');
              setImage(null);
              setScrapedImageUrl('');
              setAuthorId('');
            } else {
              setIsAdding(true);
            }
          }}
          className="btn-primary py-2 px-4 text-sm"
        >
          {isAdding ? 'Cancel' : '+ Add Video'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="max-w-3xl">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Video News' : 'Add New Video News'}</h3>
            
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 text-sm rounded">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Video Title</label>
                <input 
                  required 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="input-field py-2" 
                  placeholder="Enter video title..." 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Facebook Video URL</label>
                <div className="flex gap-2">
                  <input 
                    required 
                    type="url" 
                    value={facebookVideoUrl} 
                    onChange={e => setFacebookVideoUrl(e.target.value)} 
                    className="input-field py-2 flex-grow" 
                    placeholder="https://www.facebook.com/watch/?v=..." 
                  />
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!facebookVideoUrl) return alert('Please enter a URL first');
                      setIsScraping(true);
                      try {
                        const r = await fetch('/api/admin/scrape-fb', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url: facebookVideoUrl })
                        });
                        const d = await r.json();
                        if (r.ok && d.thumbnailUrl) {
                          setScrapedImageUrl(d.thumbnailUrl);
                          setImage(null);
                          if (d.resolvedUrl && d.resolvedUrl !== facebookVideoUrl) {
                            setFacebookVideoUrl(d.resolvedUrl);
                          }
                        } else {
                          alert(d.error || 'Failed to fetch thumbnail');
                        }
                      } catch (err) {
                        alert('Error fetching thumbnail');
                      } finally {
                        setIsScraping(false);
                      }
                    }}
                    disabled={isScraping || !facebookVideoUrl}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isScraping ? 'Fetching...' : 'Fetch Thumbnail'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Thumbnail Image (Optional)</label>
                {scrapedImageUrl && !image && (
                  <div className="mb-3 relative w-32 h-20 rounded overflow-hidden border border-gray-200">
                    <Image src={scrapedImageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    <button 
                      type="button" 
                      onClick={() => setScrapedImageUrl('')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImage(e.target.files?.[0] || null)} 
                  className="input-field py-2" 
                />
                <p className="text-xs text-gray-500 mt-1">If empty, it will use the default logo.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Author / Editor</label>
                <select 
                  value={authorId} 
                  onChange={e => setAuthorId(e.target.value)} 
                  className="input-field py-2"
                >
                  <option value="">Select an Author (Optional)</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary py-2 px-8 mt-6">
              {isSubmitting ? 'Saving...' : 'Save Video'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <th className="p-4 font-semibold">Thumbnail</th>
              <th className="p-4 font-semibold">Video Title</th>
              <th className="p-4 font-semibold">Date Added</th>
              <th className="p-4 font-semibold">Views</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {videos.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No videos found. Click '+ Add Video' to create one.</td>
              </tr>
            ) : (
              videos.map(v => (
                <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="w-24 h-14 bg-gray-800 relative rounded overflow-hidden">
                      <Image 
                        src={getOptimizedImageUrl(v.image || 'https://placehold.co/100x60/cccccc/ffffff?text=No+Image', { width: 150, quality: 60 })} 
                        alt={v.title} 
                        fill 
                        className="object-cover opacity-70"
                        sizes="96px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900 line-clamp-2">{v.title}</div>
                    <a href={v.facebookVideoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline line-clamp-1 mt-1">
                      {v.facebookVideoUrl}
                    </a>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {formatDate(v.createdAt || v.date)}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{v.views || 0}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4">
                      Edit
                    </button>
                    <button onClick={() => v._id && handleDelete(v._id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
