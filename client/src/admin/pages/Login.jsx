import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { apiUrl } from '@/services/api';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/admin/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');
      localStorage.setItem('pt_admin_token', json.token);
      localStorage.setItem('pt_admin_user', JSON.stringify(json.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="mb-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-600 mb-3" />
          <h2 className="text-2xl font-bold text-brand-black">Admin Sign In</h2>
          <p className="text-gray-600 text-sm">Premium Tees admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input {...{ value: email, onChange: (e) => setEmail(e.target.value) }} type="email" placeholder="admin@premiumtees.com" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Input {...{ value: password, onChange: (e) => setPassword(e.target.value) }} type="password" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full" loading={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="mt-6 text-xs text-gray-500 text-center">
          No public registration. Contact the super admin to create an account.
        </p>
      </Card>
    </div>
  );
};
