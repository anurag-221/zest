'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { validateAdminPassword } from '@/actions/auth-actions';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { adminLogin } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        if (username !== 'admin') {
            toast.error('Invalid Credentials ❌');
            setLoading(false);
            return;
        }

        const result = await validateAdminPassword(password);
        
        if (result.success) {
            adminLogin();
            toast.success('Admin Access Granted 🔓');
            router.push('/admin');
        } else {
            toast.error(result.message || 'Invalid Credentials ❌');
        }
    } catch (error) {
        toast.error('An error occurred during login');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/50">
             <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Secure Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              placeholder="Enter password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !username || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={20} /></>}
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">Restricted Area. Unauthorized access is monitored.</p>
        </div>
      </div>
    </div>
  );
}
