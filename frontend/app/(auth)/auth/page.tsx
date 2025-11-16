'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    agency_name: '', // Will be used as subdomain (e.g., "my travel" -> mytravel.myfly.com)
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
      } else {
        // Agency name is required for registration (will be used as subdomain)
        if (!formData.agency_name) {
          setError('Agency name is required');
          setLoading(false);
          return;
        }
        await register(formData);
      }
      router.push('/accueil');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)' }}
            >
              MyFly
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'login' ? { 
                color: '#8A77ED',
                borderBottomColor: '#8A77ED'
              } : {}}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'signup' ? { 
                color: '#8A77ED',
                borderBottomColor: '#8A77ED'
              } : {}}
            >
              Register Agency
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#2B2B2E' }}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {activeTab === 'signup' && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: '#2B2B2E' }}>
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+213"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="agency_name" className="block text-sm font-medium mb-1" style={{ color: '#2B2B2E' }}>
                    Agency Name *
                  </label>
                  <Input
                    id="agency_name"
                    type="text"
                    placeholder="e.g., My Travel"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your subdomain: <strong>{formData.agency_name ? formData.agency_name.toLowerCase().replace(/\s+/g, '') : 'agency'}.myfly.com</strong>
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#2B2B2E' }}>
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {activeTab === 'signup' && (
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1" style={{ color: '#2B2B2E' }}>
                  Confirm Password
                </label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, password_confirmation: e.target.value })
                  }
                  required={activeTab === 'signup'}
                />
              </div>
            )}

            {activeTab === 'login' && (
              <div className="text-right">
                <a 
                  href="#" 
                  className="text-sm bg-clip-text text-transparent hover:underline"
                  style={{ backgroundImage: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)' }}
                >
                  Forgotten Password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : activeTab === 'login' ? 'Log In' : 'Register Agency'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-gray-600">
          ©MyFly. All rights reserved
        </div>
      </div>
    </div>
  );
}

