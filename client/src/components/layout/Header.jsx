import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, Moon, Search, ShoppingCart, Sun, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Best Sellers', href: '/best-sellers' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-black px-1 text-[9px] font-bold leading-none text-white">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

export const Header = () => {
  const { getItemCount } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const cartCount = getItemCount();
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, searchOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
    setMobileOpen(false);
  };

  const toggleMenu = () => {
    setMobileOpen((open) => !open);
    setSearchOpen(false);
  };

  const isActive = (href) => (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href));

  return (
    <>
      {location.pathname === '/' && (
        <div className="bg-brand-black px-4 py-2 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-white sm:text-[10px] sm:tracking-[0.18em]">
          <span className="sm:hidden">Free Dhaka delivery over ৳2,000 · COD</span>
          <span className="hidden sm:inline">
            Free delivery inside Dhaka on orders over ৳2,000 &nbsp;·&nbsp; Cash on delivery nationwide
          </span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-md">
      <div className="container-premium flex h-16 items-center justify-between gap-3 sm:h-20">
        <Link
          to="/"
          className="shrink-0 whitespace-nowrap font-serif text-2xl font-bold leading-none tracking-[-0.045em] text-brand-black sm:text-3xl lg:text-[2rem] xl:text-4xl"
          aria-label="Premium Tees home"
        >
          PREMIUM<span className="text-brand-accent">TEES</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-8" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'group relative whitespace-nowrap py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors xl:text-[11px] xl:tracking-[0.18em]',
                isActive(link.href) ? 'text-brand-black' : 'text-brand-charcoal/65 hover:text-brand-black',
              )}
            >
              {link.name}
              <span
                className={cn(
                  'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-brand-black transition-transform duration-300',
                  isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label="Search products"
            aria-expanded={searchOpen}
            className="hidden rounded-full p-2 text-brand-charcoal transition-colors hover:bg-brand-offwhite sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="hidden rounded-full p-2 text-brand-charcoal transition-colors hover:bg-brand-offwhite md:inline-flex"
          >
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => navigate('/wishlist')}
            aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
            className="relative rounded-full p-2 text-brand-charcoal transition-colors hover:bg-brand-offwhite"
          >
            <Heart className="h-5 w-5" />
            <CountBadge count={wishlistCount} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
            className="relative rounded-full p-2 text-brand-charcoal transition-colors hover:bg-brand-offwhite"
          >
            <ShoppingCart className="h-5 w-5" />
            <CountBadge count={cartCount} />
          </button>
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="relative rounded-full p-2 text-brand-charcoal transition-colors hover:bg-brand-offwhite lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute inset-x-0 top-full border-b border-brand-border bg-white shadow-[0_18px_30px_-25px_rgba(10,10,10,0.5)]">
          <form onSubmit={handleSearch} className="container-premium flex items-center gap-3 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-brand-muted" />
            <label htmlFor="header-search" className="sr-only">Search products</label>
            <input
              id="header-search"
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, SKU, or fit..."
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-brand-charcoal placeholder:text-brand-muted focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-brand-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-charcoal"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="rounded-full p-2 text-brand-muted transition-colors hover:bg-brand-offwhite hover:text-brand-black"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-brand-border bg-white shadow-[0_24px_40px_-30px_rgba(10,10,10,0.6)] lg:hidden">
          <div className="container-premium py-5">
            <form onSubmit={handleSearch} className="mb-5 flex items-center gap-2 border border-brand-border px-3">
              <Search className="h-4 w-4 shrink-0 text-brand-muted" />
              <label htmlFor="mobile-search" className="sr-only">Search products</label>
              <input
                id="mobile-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="h-11 min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button type="submit" aria-label="Submit search" className="p-1.5 text-brand-black">
                <Search className="h-4 w-4" />
              </button>
            </form>

            <nav aria-label="Mobile navigation">
              <ul className="divide-y divide-brand-border/70 border-y border-brand-border/70">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className={cn(
                        'flex items-center justify-between py-3.5 text-xs font-semibold uppercase tracking-[0.18em]',
                        isActive(link.href) ? 'text-brand-black' : 'text-brand-charcoal/70',
                      )}
                    >
                      {link.name}
                      <span className="text-brand-muted">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-5 flex items-center justify-between">
              <Link to="/wishlist" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal">
                Wishlist ({wishlistCount})
              </Link>
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal"
              >
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === 'dark' ? 'Dark' : 'Light'} mode
              </button>
            </div>
          </div>
        </div>
      )}
      </header>
    </>
  );
};
