import { forwardRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Modal = forwardRef(({ open, onOpenChange, className, children, ...props }, ref) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onOpenChange} />
      <div
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 rounded-2xl sm:max-w-2xl',
          className,
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <div className="absolute right-4 top-4">
          <button onClick={onOpenChange} className="rounded-full p-1 text-brand-charcoal hover:bg-brand-offwhite transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
});
Modal.displayName = 'Modal';

export const ModalHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = ({ className, ...props }) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight text-brand-black', className)} {...props} />
);
ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = ({ className, ...props }) => (
  <div className={cn('text-sm text-brand-muted', className)} {...props} />
);
ModalDescription.displayName = 'ModalDescription';

export const ModalContent = ({ className, ...props }) => (
  <div className={cn('mt-2 sm:mt-0', className)} {...props} />
);
ModalContent.displayName = 'ModalContent';

export const ModalFooter = ({ className, ...props }) => (
  <div className={cn('mt-4 sm:mt-5 flex flex-reverse space-x-2', className)} {...props} />
);
ModalFooter.displayName = 'ModalFooter';
