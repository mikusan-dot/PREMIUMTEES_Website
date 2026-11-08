import { cn } from '@/lib/utils';

export const money = (n) => `৳${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const errMsg = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.error || (err?.response?.status === 403 ? 'Your role does not allow this action' : err?.message) || fallback;

export const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-brand-black">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Panel = ({ className, children }) => (
  <div className={cn('bg-brand-white border border-gray-200 rounded-2xl p-6', className)}>{children}</div>
);

export const Notice = ({ message }) => {
  if (!message) return null;
  const ok = message.type === 'success';
  return (
    <div className={cn('mb-4 rounded-xl border px-4 py-3 text-sm', ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700')}>
      {message.text}
    </div>
  );
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  unpaid: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
};

export const StatusBadge = ({ value }) => (
  <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', STATUS_STYLES[value] || 'bg-gray-100 text-gray-700')}>
    {value || '-'}
  </span>
);

export const Field = ({ label, children, className }) => (
  <label className={cn('block space-y-1.5', className)}>
    <span className="block text-sm font-medium text-gray-700">{label}</span>
    {children}
  </label>
);

export const selectClass = 'w-full rounded-md border border-gray-300 bg-brand-white px-3 py-2.5 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-black';

export const EmptyRow = ({ cols, text = 'Nothing here yet.' }) => (
  <tr><td colSpan={cols} className="px-4 py-8 text-center text-sm text-gray-500">{text}</td></tr>
);
