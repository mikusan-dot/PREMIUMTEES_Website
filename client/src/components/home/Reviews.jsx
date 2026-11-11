import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Star } from 'lucide-react';
import { api } from '@/services/api';

const getText = (review) => review.text || review.comment || review.body || '';
const getName = (review) => review.name || review.customerName || 'Verified customer';
const getRating = (review) => Math.min(Math.max(Number(review.rating) || 5, 1), 5);

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-3.5 w-3.5 ${index < rating ? 'fill-brand-accent text-brand-accent' : 'text-brand-border'}`}
      />
    ))}
  </div>
);

export const Reviews = () => {
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', 'home'],
    queryFn: async () => {
      const { data } = await api.get('/reviews?limit=6');
      return data.reviews || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, review) => sum + getRating(review), 0) / reviews.length;

  return (
    <section id="reviews" className="bg-brand-offwhite py-16 md:py-24">
      <div className="container-premium">
        <div className="mb-10 flex flex-col gap-5 border-b border-brand-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">In their words</p>
            <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">Worn and reviewed.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-muted">
              Real feedback from verified customers who wear Unhinged Co.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-brand-charcoal">
            <Stars rating={Math.round(average)} />
            <span className="font-semibold text-brand-black">{average.toFixed(1)}</span>
            <span className="text-brand-muted">· {reviews.length} reviews</span>
          </div>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {reviews.map((review, index) => {
            const rating = getRating(review);
            return (
              <figure
                key={review.id || `${getName(review)}-${index}`}
                className="min-w-[85%] snap-start border border-brand-border bg-brand-white p-6 sm:min-w-[60%] md:min-w-0"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <Stars rating={rating} />
                  <span className="font-serif text-4xl leading-none text-brand-border">&rdquo;</span>
                </div>
                <blockquote className="text-sm leading-relaxed text-brand-charcoal">
                  {review.title && <p className="mb-2 font-semibold text-brand-black">{review.title}</p>}
                  <p>{getText(review)}</p>
                </blockquote>
                <figcaption className="mt-6 border-t border-brand-border/80 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-black">
                    {getName(review)}
                    {(review.verified === true || review.isVerified === true) && (
                      <BadgeCheck className="h-3.5 w-3.5 text-brand-accent" aria-label="Verified customer" />
                    )}
                  </p>
                  {review.productName && <p className="mt-1 text-[11px] text-brand-muted">{review.productName}</p>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
