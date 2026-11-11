import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Badge = forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-brand-black text-brand-white',
    secondary: 'bg-brand-offwhite text-brand-charcoal',
    accent: 'bg-brand-accent text-brand-onAccent',
    outline: 'border border-brand-charcoal bg-transparent text-brand-charcoal',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    new: 'bg-brand-black text-brand-white text-[10px] uppercase tracking-wider',
    sale: 'bg-[#dc2626] text-white text-[10px] uppercase tracking-wider',
    'out-of-stock': 'bg-neutral-800 text-white text-[10px] uppercase tracking-wider',
  };
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';
