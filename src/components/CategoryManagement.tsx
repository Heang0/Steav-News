'use client';

import { useState, useEffect } from 'react';

type Category = {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      const json = await res.json();
      if (json.success) {
        setIsAdding(false);
        setName('');
        setSlug('');
        fetchCategories();
      } else {
        setError(json.message || 'Failed to add category');
      }
    } catch (err) {
      setError('An error occurred while saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchCategories();
      } else {
        alert(json.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Category Management</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-2 px-4 text-sm"
        >
          {isAdding ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="max-w-xl">
            <h3 className="text-lg font-bold mb-4">Add New Category</h3>
            
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 text-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Category Name (Khmer)</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field py-2" placeholder="e.g., កីឡា" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">URL Slug (English)</label>
                <input required type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="input-field py-2" placeholder="e.g., sports" />
                <p className="text-xs text-gray-400 mt-1">Only lowercase letters, numbers, and hyphens.</p>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary py-2 px-6">
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Slug / URL</th>
              <th className="p-4 font-semibold">Created At</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No categories found. Add one above!</td>
              </tr>
            ) : (
              categories.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900" style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}>{c.name}</td>
                  <td className="p-4 text-gray-600 font-mono text-sm">/category/{c.slug}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
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
