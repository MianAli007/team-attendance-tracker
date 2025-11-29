import { useState } from 'react';
import { Shield, User, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string, asAdmin: boolean) => boolean;
}

export function Login({ onLogin }: LoginProps) {
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = onLogin(email, password, loginType === 'admin');
    
    if (!success) {
      if (loginType === 'admin') {
        setError('Invalid admin email or password');
      } else {
        setError('Employee not found. Please check your email.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-gray-900 mb-2">Time Tracker</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginType('employee');
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
              loginType === 'employee'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            Employee
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('admin');
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
              loginType === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-5 h-5 mx-auto mb-1" />
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@company.com"
                required
              />
            </div>
          </div>

          {loginType === 'admin' && (
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            {loginType === 'admin' 
              ? 'Admin can manage employees and view reports'
              : 'Employees can track their own attendance'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
