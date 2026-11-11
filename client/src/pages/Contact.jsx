import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBrand } from '@/hooks/useStoreSettings';
import { useSeo } from '@/hooks/useSeo';

const ContactPage = () => {
  const brand = useBrand();
  useSeo({ title: 'Contact Us', description: `Get in touch with ${brand.name}. Questions about sizing, delivery or an order? We reply as soon as possible.` });
  return (
  <section className="section">
    <div className="container-premium">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-5xl font-bold text-brand-black mb-6">Contact Us</h1>
          <p className="text-brand-charcoal mb-8 leading-relaxed">
            Have a question about sizing, delivery, or an existing order? Reach out to us and
            we'll respond as soon as possible.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-offwhite flex items-center justify-center text-brand-black font-bold">✉</div>
              <div>
                <div className="font-bold text-brand-black">Email</div>
                <a href={`mailto:${brand.email}`} className="text-brand-muted hover:text-brand-black">{brand.email}</a>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-offwhite flex items-center justify-center text-brand-black font-bold">☎</div>
              <div>
                <div className="font-bold text-brand-black">Phone</div>
                <div className="text-brand-muted">{brand.phone}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-offwhite flex items-center justify-center text-brand-black font-bold">📍</div>
              <div>
                <div className="font-bold text-brand-black">Address</div>
                <div className="text-brand-muted">{brand.address}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-brand-border rounded-2xl p-8 bg-brand-white">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <Input type="text" placeholder="Full name" />
              <Input type="email" placeholder="Email address" />
            </div>
            <Input type="text" placeholder="Subject" />
            <textarea
              rows="5"
              placeholder="Your message"
              className="block w-full rounded-md border border-brand-border bg-brand-white px-4 py-2.5 text-brand-charcoal shadow-sm placeholder:text-brand-muted focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  </section>  );
};

export const Contact = ContactPage;
