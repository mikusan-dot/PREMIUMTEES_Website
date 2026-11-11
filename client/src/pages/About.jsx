import { Link } from 'react-router-dom';
import { useBrand } from '@/hooks/useStoreSettings';
import { useSeo } from '@/hooks/useSeo';

export const About = () => {
  const brand = useBrand();
  useSeo({ title: 'About', description: `${brand.name} is a premium streetwear brand from Bangladesh. ${brand.tagline}` });
  return (
    <section className="section">
      <div className="container-premium">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-muted">{brand.tagline}</p>
          <h1 className="mb-6 text-5xl font-bold text-brand-black">About {brand.name}</h1>
          <p className="mb-8 text-lg leading-relaxed text-brand-charcoal">
            {brand.name} is a premium streetwear brand based in Bangladesh. We make heavyweight tees,
            drop shoulders, hoodies, full sleeves and sweatshirts with bold, minimal design and a fit that
            feels as good as it looks.
          </p>
          <p className="mb-10 text-lg leading-relaxed text-brand-charcoal">
            Honest pricing, a simple shopping experience with no account required, and payment options
            including bKash, Nagad, cards and Cash on Delivery — delivered across Bangladesh.
          </p>
          <Link to="/shop" className="inline-block bg-brand-black px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-white">
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
};
