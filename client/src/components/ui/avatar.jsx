import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Avatar = forwardRef(({ className, src, alt, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    >
      {src ? <img src={src} alt={alt ?? 'User'} className="aspect-square h-full w-full object-cover" /> : null}
    </div>
  );
});
Avatar.displayName = 'Avatar';

export const Separator = ({ className, ...props }) => (
  <div className={cn('mx-1 h-[1px] w-full bg-brand-border', className)} {...props} />
);
Separator.displayName = 'Separator';
