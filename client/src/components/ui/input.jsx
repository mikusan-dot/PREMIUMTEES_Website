import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-brand-border bg-brand-white px-3 py-2 text-brand-charcoal shadow-sm placeholder:text-brand-muted focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none transition-all sm:text-sm',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Label = ({ className, ...props }) => (
  <label className={cn('block text-sm font-medium text-brand-charcoal mb-1.5', className)} {...props} />
);
Label.displayName = 'Label';
