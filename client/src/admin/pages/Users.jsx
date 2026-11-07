import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Panel, Notice, EmptyRow, Field, selectClass, formatDate, errMsg } from '@/admin/components/common';

const ROLES = [
  ['super_admin', 'Super admin (everything)'],
  ['product_manager', 'Product manager (products, categories)'],
  ['order_manager', 'Order manager (orders, payments)'],
  ['marketing_manager', 'Marketing manager (coupons, banners)'],
  ['viewer', 'Viewer (read only)'],
];

export const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', role: 'viewer' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  let me = {};
  try { me = JSON.parse(localStorage.getItem('pt_admin_user') || '{}'); } catch { me = {}; }

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setAdmins(res.data.admins || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load admins') });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/admin/users', { email: form.email.trim(), role: form.role, ...(form.password ? { password: form.password } : {}) });
      setMessage({ type: 'success', text: `${form.email} can now sign in as ${form.role.replace('_', ' ')}` });
      setForm({ email: '', password: '', role: 'viewer' });
      load();
    } catch (err) {
      const details = err.response?.data?.details?.[0];
      setMessage({ type: 'error', text: details ? `${details.path?.join('.')}: ${details.message}` : errMsg(err, 'Failed to add admin') });
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (a, role) => {
    try {
      await api.put(`/admin/users/${a.id}`, { role });
      setMessage({ type: 'success', text: `${a.email} is now ${role.replace('_', ' ')}` });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to change role') });
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Remove admin access for ${a.email}?`)) return;
    try {
      await api.delete(`/admin/users/${a.id}`);
      setMessage({ type: 'success', text: `${a.email} no longer has admin access` });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to remove admin') });
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Admin Users" subtitle="Only super admins can add people or change roles" />
      <Notice message={message} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2 h-fit">
          <h2 className="mb-4 font-bold text-black">Add an admin</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="person@example.com" required /></Field>
            <Field label="Password (only for a new person)">
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
            </Field>
            <p className="-mt-2 text-xs text-gray-500">Leave the password empty if this email already has a sign-in account.</p>
            <Field label="Role">
              <select className={selectClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </Field>
            <Button type="submit" disabled={saving} loading={saving} className="w-full">{saving ? 'Adding...' : 'Add admin'}</Button>
          </form>
        </Panel>

        <Panel className="lg:col-span-3 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Added</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {loading && <EmptyRow cols={4} text="Loading..." />}
                {!loading && admins.length === 0 && <EmptyRow cols={4} text="No admins found." />}
                {admins.map((a) => {
                  const isMe = a.email === me.email;
                  return (
                    <tr key={a.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-black">{a.email}{isMe && <span className="ml-2 text-xs text-gray-500">(you)</span>}</td>
                      <td className="px-4 py-3">
                        <select className={`${selectClass} w-auto`} value={a.role} disabled={isMe} onChange={(e) => changeRole(a, e.target.value)}>
                          {ROLES.map(([v]) => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                      <td className="px-4 py-3 text-right">{!isMe && <Button size="sm" variant="destructive" onClick={() => remove(a)}>Remove</Button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};
