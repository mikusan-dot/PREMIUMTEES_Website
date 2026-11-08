import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl border border-brand-border bg-brand-white shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight text-brand-black', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';
