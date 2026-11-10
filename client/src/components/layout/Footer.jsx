import { Link } from 'react-router-dom';
import { Facebook, Instagram, Music2 } from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const SHOP_LINKS = [
  { name: 'Shop All', href: '/shop' },
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Best Sellers', href: '/best-sellers' },
  { name: 'Sale', href: '/sale' },
  { name: 'Collections', href: '/collections' },
  { name: 'Categories', href: '/categories' },
  { name: 'Wishlist', href: '/wishlist' },
];

const HELP_LINKS = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'Track Order', href: '/track' },
  { name: 'Shipping & Returns', href: '/about' },
  { name: 'Privacy Policy', href: '/about' },
  { name: 'Terms & Conditions', href: '/about' },
];

const PAYMENTS = ['Cash on Delivery', 'bKash', 'Nagad', 'Visa', 'Mastercard'];

export const Footer = () => {
  const settings = useStoreSettings();
  const instagram = settings.instagramUrl || 'https://www.instagram.com/';

  return (
    <footer className="border-t border-white/10 bg-brand-night text-white">
      <div className="container-premium py-14 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-4">
            <Link
              to="/"
              className="inline-block font-serif text-2xl font-bold leading-none tracking-[-0.045em] text-white sm:text-3xl"
            >
              PREMIUM<span className="text-brand-accent">TEES</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/50">
              Considered essentials in heavyweight cotton. Designed in Dhaka, made to be worn on repeat.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Music2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {SHOP_LINKS.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/65 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Help</h4>
            <ul className="space-y-2.5 text-sm">
              {HELP_LINKS.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/65 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-4">
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">We accept</h4>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((payment) => (
                <span
                  key={payment}
                  className="border border-white/15 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/60"
                >
                  {payment}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-xs text-xs leading-relaxed text-white/35">
              Cash on delivery available nationwide. Delivery charges are calculated at checkout.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Premium Tees. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Designed in Dhaka, Bangladesh</span>
            <Link to="/about" className="transition-colors hover:text-white">Privacy</Link>
            <Link to="/about" className="transition-colors hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
