import { useEffect, useRef, useState } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useBrand } from '@/hooks/useStoreSettings';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Heart, Menu, Moon, Search, ShoppingCart, Sun, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTheme } from '@/context/ThemeContext';
import { useCategories, FALLBACK_CATEGORY_IMAGE } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

const SIMPLE_LINKS = {
  before: [{ name: 'Home', href: '/' }],
  after: [
    { name: 'Best Sellers', href: '/best-sellers' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Sale', href: '/sale', accent: true },
  ],
};

const MORE_LINKS = [
  { name: 'Shop All', href: '/shop' },
  { name: 'Collections', href: '/collections' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-black px-1 text-[9px] font-bold leading-none text-brand-white">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

const ICON_BTN =
  'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-charcoal transition-colors hover:bg-brand-offwhite active:bg-brand-border/60 max-[359px]:h-9 max-[359px]:w-9 sm:h-11 sm:w-11';

const NAV_LINK =
  'group relative inline-flex items-center gap-1 whitespace-nowrap py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors xl:text-[11px] xl:tracking-[0.18em]';

const Underline = ({ active }) => (
  <span
    className={cn(
      'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-brand-black transition-transform duration-300',
      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
    )}
  />
);

export const Header = () => {
  const brand = useBrand();
  const { getItemCount } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const { isDark, toggle } = useTheme();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaPinned, setMegaPinned] = useState(false);
  const searchRef = useRef(null);
  const megaRef = useRef(null);
  const megaButtonRef = useRef(null);
  const closeTimer = useRef(null);

  const cartCount = getItemCount();
  const wishlistCount = wishlistIds.length;

  const closeMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(false);
    setMegaPinned(false);
  };

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    closeMega();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!mobileOpen && !searchOpen && !megaOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (megaOpen) megaButtonRef.current?.focus();
        setMobileOpen(false);
        setSearchOpen(false);
        closeMega();
      }
    };
    const onPointerDown = (event) => {
      if (megaOpen && megaRef.current && !megaRef.current.contains(event.target)) closeMega();
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [mobileOpen, searchOpen, megaOpen]);

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
    closeMega();
  };

  const toggleMenu = () => {
    setMobileOpen((open) => !open);
    setSearchOpen(false);
    closeMega();
  };

  // Hover opens the mega-menu; a click pins it open (so it never flickers shut under the cursor).
  const hoverOpen = () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const hoverClose = () => {
    if (megaPinned) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 260);
  };
  const clickMega = () => {
    setSearchOpen(false);
    if (megaOpen && !megaPinned) {
      setMegaPinned(true);
    } else if (megaOpen) {
      closeMega();
    } else {
      setMegaOpen(true);
      setMegaPinned(true);
    }
  };

  const isActive = (href) => (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href));
  const categoriesActive = location.pathname.startsWith('/category') || location.pathname.startsWith('/categories');
  const activeCategorySlug = location.pathname.startsWith('/category/') ? location.pathname.split('/')[2] : null;

  const renderLink = (link) => (
    <Link
      key={link.name}
      to={link.href}
      className={cn(
        NAV_LINK,
        link.accent ? 'text-red-600 hover:text-red-700' : isActive(link.href) ? 'text-brand-black' : 'text-brand-charcoal/65 hover:text-brand-black',
      )}
    >
      {link.name}
      <Underline active={isActive(link.href)} />
    </Link>
  );

  return (
    <>
      {location.pathname === '/' && (
        <div className="bg-brand-night px-4 py-2 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-white sm:text-[10px] sm:tracking-[0.18em]">
          <span className="sm:hidden">Free Dhaka delivery over ৳2,000 · COD</span>
          <span className="hidden sm:inline">
            Free delivery inside Dhaka on orders over ৳2,000 &nbsp;·&nbsp; Cash on delivery nationwide
          </span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-white/95 backdrop-blur-md">
        <div className="container-premium flex h-16 items-center justify-between gap-3 sm:h-20">
          <Link
            to="/"
            className="shrink-0 whitespace-nowrap text-brand-black"
            aria-label={`${brand.name} home`}
          >
            <BrandLogo className="text-[1.1rem] max-[359px]:text-[0.95rem] sm:text-2xl lg:text-[1.65rem] xl:text-3xl" />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-9" aria-label="Primary navigation">
            {SIMPLE_LINKS.before.map(renderLink)}

            <div ref={megaRef} onMouseEnter={hoverOpen} onMouseLeave={hoverClose} className="flex items-center">
              <button
                ref={megaButtonRef}
                type="button"
                onClick={clickMega}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                aria-controls="categories-menu"
                className={cn(NAV_LINK, categoriesActive || megaOpen ? 'text-brand-black' : 'text-brand-charcoal/65 hover:text-brand-black')}
              >
                Categories
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300', megaOpen && 'rotate-180')} />
                <Underline active={categoriesActive || megaOpen} />
              </button>

              <div
                id="categories-menu"
                className={cn(
                  'absolute inset-x-0 top-full border-b border-brand-border bg-brand-white shadow-[0_24px_40px_-30px_rgba(10,10,10,0.6)] transition-all duration-200',
                  megaOpen ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none -translate-y-2 opacity-0',
                )}
              >
                <div className="container-premium py-7">
                  <ul className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          to={`/category/${category.slug}`}
                          className={cn('group block', activeCategorySlug === category.slug && 'opacity-100')}
                        >
                          <span className="block aspect-[4/3] overflow-hidden bg-brand-offwhite">
                            <img
                              src={category.image || FALLBACK_CATEGORY_IMAGE}
                              alt=""
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; e.currentTarget.onerror = null; }}
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          </span>
                          <span className="mt-2.5 flex items-baseline justify-between gap-2">
                            <span className={cn('text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors group-hover:text-brand-accent', activeCategorySlug === category.slug ? 'text-brand-accent' : 'text-brand-black')}>
                              {category.name}
                            </span>
                            {category.productCount > 0 && <span className="text-[10px] text-brand-muted">{category.productCount}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-brand-charcoal/70">
                      <Link to="/shop" className="hover:text-brand-black">Shop all</Link>
                      <Link to="/collections" className="hover:text-brand-black">Collections</Link>
                    </div>
                    <Link to="/categories" className="inline-flex items-center gap-2 text-brand-black hover:text-brand-accent">
                      View all categories <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {SIMPLE_LINKS.after.map(renderLink)}
          </nav>

          <div className="flex shrink-0 items-center gap-0 sm:gap-1.5">
            <button type="button" onClick={toggleSearch} aria-label="Search products" aria-expanded={searchOpen} className={ICON_BTN}>
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className={cn(ICON_BTN, 'max-[399px]:hidden')}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
              className={ICON_BTN}
            >
              <Heart className="h-5 w-5" />
              <CountBadge count={wishlistCount} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
              className={ICON_BTN}
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
              className={cn(ICON_BTN, 'lg:hidden')}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="absolute inset-x-0 top-full border-b border-brand-border bg-brand-white shadow-[0_18px_30px_-25px_rgba(10,10,10,0.5)]">
            <form onSubmit={handleSearch} className="container-premium flex items-center gap-3 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-brand-muted" />
              <label htmlFor="header-search" className="sr-only">Search products</label>
              <input
                id="header-search"
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products or fit..."
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-brand-charcoal placeholder:text-brand-muted focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 bg-brand-black px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-white transition-colors hover:bg-brand-charcoal"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-offwhite hover:text-brand-black"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {mobileOpen && (
          <div id="mobile-navigation" className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-brand-border bg-brand-white shadow-[0_24px_40px_-30px_rgba(10,10,10,0.6)] lg:hidden">
            <div className="container-premium py-5">
              <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 border border-brand-border px-3">
                <Search className="h-4 w-4 shrink-0 text-brand-muted" />
                <label htmlFor="mobile-search" className="sr-only">Search products</label>
                <input
                  id="mobile-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products..."
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-brand-charcoal placeholder:text-brand-muted focus:outline-none"
                />
                <button type="submit" aria-label="Submit search" className="inline-flex h-11 w-11 items-center justify-center text-brand-black">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              <nav aria-label="Mobile navigation">
                <ul className="divide-y divide-brand-border/70 border-y border-brand-border/70 text-xs font-semibold uppercase tracking-[0.18em]">
                  {SIMPLE_LINKS.before.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href} className={cn('flex min-h-[48px] items-center justify-between', isActive(link.href) ? 'text-brand-black' : 'text-brand-charcoal/70')}>
                        {link.name}
                      </Link>
                    </li>
                  ))}

                  <li>
                    <button
                      type="button"
                      onClick={() => setMobileCategoriesOpen((open) => !open)}
                      aria-expanded={mobileCategoriesOpen}
                      aria-controls="mobile-categories"
                      className={cn('flex min-h-[48px] w-full items-center justify-between uppercase tracking-[0.18em]', categoriesActive ? 'text-brand-black' : 'text-brand-charcoal/70')}
                    >
                      Categories
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', mobileCategoriesOpen && 'rotate-180')} />
                    </button>
                    <div
                      id="mobile-categories"
                      className={cn('grid transition-all duration-300 ease-out', mobileCategoriesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
                    >
                      <ul className="overflow-hidden">
                        {categories.map((category) => (
                          <li key={category.slug}>
                            <Link
                              to={`/category/${category.slug}`}
                              tabIndex={mobileCategoriesOpen ? 0 : -1}
                              className={cn('flex min-h-[52px] items-center gap-3 border-t border-brand-border/50 pl-2 normal-case tracking-normal', activeCategorySlug === category.slug ? 'text-brand-accent' : 'text-brand-charcoal')}
                            >
                              <img
                                src={category.image || FALLBACK_CATEGORY_IMAGE}
                                alt=""
                                loading="lazy"
                                onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; e.currentTarget.onerror = null; }}
                                className="h-9 w-9 shrink-0 rounded object-cover"
                              />
                              <span className="flex-1 text-sm font-medium">{category.name}</span>
                              {category.productCount > 0 && <span className="pr-1 text-xs font-normal text-brand-muted">{category.productCount}</span>}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            to="/categories"
                            tabIndex={mobileCategoriesOpen ? 0 : -1}
                            className="flex min-h-[48px] items-center gap-2 border-t border-brand-border/50 pl-2 text-[11px] text-brand-black"
                          >
                            View all categories <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>

                  {SIMPLE_LINKS.after.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href} className={cn('flex min-h-[48px] items-center justify-between', link.accent ? 'text-red-600' : isActive(link.href) ? 'text-brand-black' : 'text-brand-charcoal/70')}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal/70">
                  {MORE_LINKS.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href} className="flex min-h-[44px] items-center">{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-3 flex items-center justify-between border-t border-brand-border/70 pt-3">
                <Link to="/wishlist" className="inline-flex min-h-[44px] items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal">
                  Wishlist ({wishlistCount})
                </Link>
                <button
                  type="button"
                  onClick={toggle}
                  className="inline-flex min-h-[44px] items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? 'Switch to light' : 'Switch to dark'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
