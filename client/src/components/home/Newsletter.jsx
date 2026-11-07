import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check } from 'lucide-react';
import { api } from '@/services/api';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email address').email('Enter a valid email address'),
});

export const Newsletter = () => {
  const [status, setStatus] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const subscribe = async ({ email }) => {
    setStatus(null);
    try {
      await api.post('/newsletter', { email });
      setStatus({ type: 'success', text: 'You are on the list. Watch your inbox for the next drop.' });
      reset();
    } catch (err) {
      setStatus({
        type: 'error',
        text: err?.response?.data?.error || 'Could not subscribe right now. Please try again.',
      });
    }
  };

  return (
    <section id="newsletter" className="bg-brand-black py-20 text-white md:py-28">
      <div className="container-premium">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">The List</p>
            <h2 className="max-w-lg font-serif text-4xl leading-[1.05] text-white md:text-5xl">
              First access.
              <br />
              No noise.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:pl-10">
            <p className="mb-6 max-w-md text-sm leading-relaxed text-white/60">
              Early access to limited drops, restocks, and studio notes. One considered email, nothing more.
            </p>
            <form onSubmit={handleSubmit(subscribe)} noValidate className="max-w-md">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Your email address"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    className="h-12 w-full border border-white/20 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
                    {...register('email')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center gap-2 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black transition-colors hover:bg-brand-offwhite disabled:opacity-60"
                >
                  {isSubmitting ? 'Joining...' : 'Subscribe'}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
              {status && (
                <p className={`mt-3 flex items-center gap-1.5 text-xs ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {status.type === 'success' && <Check className="h-3.5 w-3.5" />}
                  {status.text}
                </p>
              )}
              <p className="mt-4 text-[11px] text-white/35">No spam. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
