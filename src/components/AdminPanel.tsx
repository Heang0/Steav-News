'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import ArticleList from '@/components/ArticleList';
import { Article } from '@/types';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'list'>('create');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const router = useRouter();

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      setIsAuthenticated(true);
      setActiveTab('list');
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('sessionId', data.sessionId);
        setIsAuthenticated(true);
        setActiveTab('list');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionId');
    setIsAuthenticated(false);
    setActiveTab('create');
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setActiveTab('edit');
  };

  const handleArticleCreated = () => {
    setActiveTab('list');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="admin-container max-w-md w-full bg-white p-8 rounded-xl shadow-lg mt-20">
            <h2 className="text-3xl font-bold text-primary text-center mb-6">
              Admin Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}

              <button
                type="submit"
                className="btn-primary w-full py-3 text-lg"
              >
                Login
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-8 px-4">
        <div className="admin-container max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
          {/* Admin Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-primary">
              Admin Panel - Manage Articles
            </h2>
            <button
              onClick={handleLogout}
              className="btn-secondary px-4 py-2"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'list'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => {
                setEditingArticle(null);
                setActiveTab('create');
              }}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Create Article
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'create' && (
              <ArticleForm onSuccess={handleArticleCreated} />
            )}

            {activeTab === 'edit' && editingArticle && (
              <ArticleForm
                article={editingArticle}
                onSuccess={() => setActiveTab('list')}
                onCancel={() => setActiveTab('list')}
              />
            )}

            {activeTab === 'list' && (
              <ArticleList onEdit={handleEditArticle} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
