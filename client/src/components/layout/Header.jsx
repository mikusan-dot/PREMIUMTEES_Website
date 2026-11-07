import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, User, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Categories', href: '/categories' },
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Best Sellers', href: '/best-sellers' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const Header = () => {
  const { items, getItemCount } = useCartStore();
  const { toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  const cartCount = getItemCount();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-brand-border bg-white/80 backdrop-blur-md">
        <div className="container-premium flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <Link to="/" className="font-serif text-2xl font-bold text-brand-black tracking-tighter">
            PREMIUM<span className="text-brand-accent">TEES</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-charcoal">
            {NAV_LINKS.map((link) => (
              <Link key={link.name} to={link.href} className={cnNav(link.href === location.pathname ? 'text-brand-accent' : '')}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggle} className="p-2 text-brand-charcoal hover:bg-brand-offwhite rounded-full transition-colors">
              {themeIcon()}
            </button>
            <button className="p-2 text-brand-charcoal hover:bg-brand-offwhite rounded-full relative transition-colors">
              <Heart className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-brand-accent" />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-brand-charcoal hover:bg-brand-offwhite rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-black text-white text-[10px] font-bold px-1.5">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 text-brand-charcoal hover:bg-brand-offwhite rounded-full transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-center border-b border-brand-border/50 bg-white py-3">
        <form onSubmit={handleSearch} className="container-premium flex items-center w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Input
            type="search"
            placeholder="Search products, SKU..."
            className="w-full max-w-md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="outline" size="sm" className="ml-2 hidden lg:flex gap-2">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </form>
      </div>
    </>
  );
};

function cnNav(...classes) {
  return classes.filter(Boolean).join(' ');
}

function themeIcon() {
  return <Sun className="h-5 w-5" />;
}

function Sun() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  );
}

export const Footer = () => (
  <footer className="bg-brand-black text-brand-offwhite border-t border-white/10">
    <div className="container-premium py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="font-serif text-2xl font-bold text-white tracking-tighter mb-4 inline-block">
            PREMIUM<span className="text-brand-accent">TEES</span>
          </Link>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Minimalist premium T-shirts crafted for Bangladesh. Quality fabric, timeless fit.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Shop</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {NAV_LINKS.map((l) => (
              <li key={l.name}><Link to={l.href} className="hover:text-white transition-colors">{l.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Support</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><a href="mailto:support@premiumtees.com" className="hover:text-white transition-colors">support@premiumtees.com</a></li>
            <li><a href="tel:+8801700000000" className="hover:text-white transition-colors">+880 1700 000000</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-4">Subscribe for updates and new arrivals.</p>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Enter your email" className="flex-1" />
            <Button variant="outline" size="sm">Subscribe</Button>
          </form>
          <div className="mt-6 flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white"><User className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white"><ShieldCheck className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <div>© {new Date().getFullYear()} Premium Tees. All rights reserved.</div>
        <div className="flex gap-6 text-sm">
          <a href="/about" className="hover:text-white">Privacy Policy</a>
          <a href="/about" className="hover:text-white">Return &amp; Refund</a>
          <a href="/about" className="hover:text-white">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>
  </footer>
);
