import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Button = forwardRef(({ className, variant = 'default', size = 'default', disabled, asChild = false, ...props }, ref) => {
  const Comp = asChild ? props.as || 'span' : 'button';
  const variants = {
    default: 'bg-brand-black text-white hover:bg-brand-charcoal',
    accent: 'bg-brand-accent text-white hover:bg-brand-accentHover',
    outline: 'border border-brand-charcoal bg-transparent text-brand-black hover:bg-brand-black hover:text-white',
    ghost: 'hover:bg-brand-offwhite text-brand-charcoal',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-5 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };
  return (
    <Comp
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...(asChild ? {} : { type: 'button' })}
      {...props}
    />
  );
});
Button.displayName = 'Button';
