import { Link } from 'react-router-dom';
import { Facebook, Instagram, Music2 } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useBrand, useStoreSettings } from '@/hooks/useStoreSettings';

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
  { name: 'Shipping & Returns', href: '/terms#shipping' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
];

const PAYMENTS = ['Cash on Delivery', 'bKash', 'Nagad', 'Visa', 'Mastercard'];

export const Footer = () => {
  const settings = useStoreSettings();
  const brand = useBrand();
  const instagram = settings.instagramUrl || 'https://www.instagram.com/';

  return (
    <footer className="border-t border-white/10 bg-brand-night text-white">
      <div className="container-premium py-20 md:py-28">
        <div className="grid gap-12 md:gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="col-span-2 lg:col-span-4">
            <Link
              to="/"
              className="inline-block text-white"
              aria-label={`${brand.name} home`}
            >
              <BrandLogo className="text-2xl sm:text-3xl" imgClassName="h-9 w-auto max-w-[12rem] brightness-0 invert" />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">
              {brand.tagline} Premium streetwear designed in Dhaka, made in heavyweight cotton.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={settings.facebookUrl || 'https://www.facebook.com/'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={settings.tiktokUrl || 'https://www.tiktok.com/'}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Music2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Shop</h4>
            <ul className="space-y-3 text-sm">
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
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Help</h4>
            <ul className="space-y-3 text-sm">
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
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">We accept</h4>
            <div className="flex flex-wrap gap-3">
              {PAYMENTS.map((payment) => (
                <span
                  key={payment}
                  className="border border-white/15 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-white/60"
                >
                  {payment}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-xs text-xs leading-relaxed text-white/35">
              Cash on delivery available nationwide. Delivery charges are calculated at checkout.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name} All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span>Designed in Dhaka, Bangladesh</span>
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
