'use client';

import { useState, useEffect } from 'react';

export default function SettingsManagement() {
  const [siteTitle, setSiteTitle] = useState('');
  const [defaultSeoDescription, setDefaultSeoDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setSiteTitle(json.data.siteTitle);
          setDefaultSeoDescription(json.data.defaultSeoDescription);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteTitle, defaultSeoDescription }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
      } else {
        setMessage({ text: json.message || 'Failed to save settings', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred while saving', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Global Site Settings</h3>
        <p className="text-gray-500 max-w-md mx-auto">Manage global configuration like Site Title and SEO Metadata.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message.text && (
          <div className={`p-4 text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Site Title</label>
          <input 
            type="text" 
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="input-field py-3 text-lg font-bold" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Default SEO Description</label>
          <textarea 
            value={defaultSeoDescription}
            onChange={(e) => setDefaultSeoDescription(e.target.value)}
            className="input-field py-3 min-h-[120px] resize-y" 
            required
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full btn-primary py-3 text-lg"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
