'use client';

import { useState, useEffect } from 'react';
import { Staff } from '@/types';
import Image from 'next/image';

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Writer');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const json = await res.json();
      if (json.success) {
        setStaff(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('role', role);
      formData.append('phone', phone);
      formData.append('dob', dob);
      if (image) formData.append('image', image);

      const res = await fetch('/api/staff', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setIsAdding(false);
        // Reset form
        setName('');
        setRole('Writer');
        setPhone('');
        setDob('');
        setImage(null);
        fetchStaff();
      } else {
        setError(json.message || 'Failed to add staff');
      }
    } catch (err) {
      setError('An error occurred while saving staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading staff...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-2 px-4 text-sm"
        >
          {isAdding ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Add New Staff Member</h3>
            
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 text-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field py-2" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="input-field py-2">
                  <option value="Writer">Writer</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="input-field py-2" placeholder="Phone Number" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="input-field py-2" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Profile Photo</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="input-field py-2" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary py-2 px-6">
              {isSubmitting ? 'Saving...' : 'Save Staff Member'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <th className="p-4 font-semibold">Staff Member</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No staff members found.</td>
              </tr>
            ) : (
              staff.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 overflow-hidden relative flex-shrink-0">
                        {s.photo ? (
                          <Image src={s.photo} alt={s.name} fill className="object-cover" unoptimized={s.photo.startsWith('http')} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                            {s.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      s.role === 'Admin' ? 'bg-red-100 text-red-700' : 
                      s.role === 'Editor' ? 'bg-blue-100 text-blue-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{s.phone || 'N/A'}</td>
                  <td className="p-4 text-gray-500 text-sm font-mono">{s.staffId}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(s.createdAt).toLocaleDateString()}
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
