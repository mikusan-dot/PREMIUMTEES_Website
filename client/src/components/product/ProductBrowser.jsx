import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';
import { GridMessage } from '@/components/product/ProductListingPage';
import { colorHex } from '@/lib/product';
import { dedupeProducts } from '@/lib/badges';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;
const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Best selling' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A–Z' },
];
const money = (v) => `৳${Number(v || 0).toLocaleString('en-US')}`;
const csv = (value) => String(value || '').split(',').filter(Boolean);

const useDebounced = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-lg border border-brand-border bg-brand-white">
        <div className="aspect-[4/5] animate-pulse bg-brand-offwhite" />
        <div className="space-y-3 p-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-brand-offwhite" />
          <div className="h-10 w-full animate-pulse rounded bg-brand-offwhite" />
        </div>
      </div>
    ))}
  </div>
);

const Section = ({ title, children }) => (
  <div className="border-b border-brand-border py-5 first:pt-0 last:border-0">
    <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black">{title}</h3>
    {children}
  </div>
);

const FiltersPanel = ({ filters, facets, categoryOptions, onChange, onClear }) => {
  const [minInput, setMinInput] = useState(filters.minPrice);
  const [maxInput, setMaxInput] = useState(filters.maxPrice);
  const applied = useRef(`${filters.minPrice}|${filters.maxPrice}`);

  // Pull in price changes made elsewhere (chip removed, "clear all", back button) — but never
  // overwrite what the shopper is still typing.
  useEffect(() => {
    const fromUrl = `${filters.minPrice}|${filters.maxPrice}`;
    if (fromUrl !== applied.current) {
      applied.current = fromUrl;
      setMinInput(filters.minPrice);
      setMaxInput(filters.maxPrice);
    }
  }, [filters.minPrice, filters.maxPrice]);

  // Min and max are debounced together so a half-typed range is never applied.
  const typed = useDebounced(`${minInput}|${maxInput}`, 600);
  useEffect(() => {
    if (typed === applied.current) return;
    applied.current = typed;
    const [min, max] = typed.split('|');
    onChange({ minPrice: min, maxPrice: max });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  const sizes = [...new Set([...(facets.sizes || []), ...filters.size])];
  const colors = [...new Set([...(facets.colors || []), ...filters.color])];
  const toggle = (key, value) => {
    const list = filters[key];
    const lower = value.toLowerCase();
    const next = list.some((v) => v.toLowerCase() === lower) ? list.filter((v) => v.toLowerCase() !== lower) : [...list, value];
    onChange({ [key]: next });
  };
  const has = (key, value) => filters[key].some((v) => v.toLowerCase() === value.toLowerCase());
  const input = 'h-11 w-full border border-brand-border bg-brand-white px-3 text-sm text-brand-charcoal placeholder:text-brand-muted focus:border-brand-accent focus:outline-none';

  return (
    <div>
      {categoryOptions?.length > 0 && (
        <Section title="Category">
          <div className="flex flex-wrap gap-2">
            {[{ slug: '', name: 'All' }, ...categoryOptions].map((c) => (
              <button
                key={c.slug || 'all'}
                type="button"
                onClick={() => onChange({ category: c.slug })}
                aria-pressed={filters.category === c.slug}
                className={cn('min-h-[40px] border px-3 text-xs font-medium transition-colors', filters.category === c.slug ? 'border-brand-black bg-brand-black text-brand-white' : 'border-brand-border text-brand-charcoal hover:border-brand-black')}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Price (৳)">
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" min="0" aria-label="Minimum price" placeholder={facets.minPrice ? String(facets.minPrice) : 'Min'} value={minInput} onChange={(e) => setMinInput(e.target.value)} className={input} />
          <span className="text-brand-muted">–</span>
          <input type="number" inputMode="numeric" min="0" aria-label="Maximum price" placeholder={facets.maxPrice ? String(facets.maxPrice) : 'Max'} value={maxInput} onChange={(e) => setMaxInput(e.target.value)} className={input} />
        </div>
        {facets.maxPrice > 0 && <p className="mt-2 text-xs text-brand-muted">Range here: {money(facets.minPrice)} – {money(facets.maxPrice)}</p>}
      </Section>

      {sizes.length > 0 && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggle('size', s)}
                aria-pressed={has('size', s)}
                className={cn('flex h-10 min-w-[44px] items-center justify-center border px-3 text-xs font-medium transition-colors', has('size', s) ? 'border-brand-black bg-brand-black text-brand-white' : 'border-brand-border text-brand-charcoal hover:border-brand-black')}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}

      {colors.length > 0 && (
        <Section title="Colour">
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggle('color', c)}
                aria-pressed={has('color', c)}
                aria-label={c}
                title={c}
                style={{ backgroundColor: colorHex(c) }}
                className={cn('relative flex h-9 w-9 items-center justify-center rounded-full border border-brand-charcoal/25 transition-all', has('color', c) && 'ring-2 ring-brand-accent ring-offset-2 ring-offset-brand-offwhite')}
              >
                {has('color', c) && <Check className={cn('h-4 w-4', ['white', 'cream', 'offwhite', 'beige', 'sand', 'yellow', 'pink', 'sky'].includes(c.toLowerCase()) ? 'text-black' : 'text-white')} />}
              </button>
            ))}
          </div>
        </Section>
      )}

      <button type="button" onClick={onClear} className="mt-2 inline-flex min-h-[44px] items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">
        Clear all filters
      </button>
    </div>
  );
};

/**
 * Server-driven product grid with search, price / size / colour filters, sorting and "load more".
 * Filter state lives in the URL, so results are shareable and survive refresh / back navigation.
 * `fixedParams` scope the list (e.g. { category: 'hoodies' } or { onSale: true }).
 */
export const ProductBrowser = ({ queryKey, fixedParams = {}, categoryOptions, emptyTitle = 'No products found.', emptyText = 'Try a different search or clear your filters.' }) => {
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);

  const filters = useMemo(() => ({
    q: params.get('q') || '',
    sort: params.get('sort') || 'featured',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    size: csv(params.get('size')),
    color: csv(params.get('color')),
    category: params.get('category') || '',
  }), [params]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      const v = Array.isArray(value) ? value.join(',') : value;
      if (v === '' || v === undefined || v === null || (key === 'sort' && v === 'featured')) next.delete(key);
      else next.set(key, v);
    });
    setParams(next, { replace: true });
  };
  const clearAll = () => {
    const next = new URLSearchParams();
    setParams(next, { replace: true });
  };

  const [searchText, setSearchText] = useState(filters.q);
  useEffect(() => { setSearchText(filters.q); }, [filters.q]);
  const debouncedSearch = useDebounced(searchText, 400);
  useEffect(() => { if (debouncedSearch !== filters.q) update({ q: debouncedSearch }); }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useInfiniteQuery({
    queryKey: [queryKey, fixedParams, filters],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/products', {
        params: {
          ...fixedParams,
          q: filters.q || undefined,
          sort: filters.sort,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          size: filters.size.join(',') || undefined,
          color: filters.color.join(',') || undefined,
          category: filters.category || fixedParams.category || undefined,
          page: pageParam,
          limit: PAGE_SIZE,
        },
      });
      return data;
    },
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });

  const pages = query.data?.pages || [];
  const products = dedupeProducts(pages.flatMap((p) => p.products));
  const total = pages[0]?.total ?? 0;
  const facets = pages[0]?.facets || { colors: [], sizes: [], minPrice: 0, maxPrice: 0 };
  const activeCount = [filters.minPrice || filters.maxPrice ? 1 : 0, filters.size.length, filters.color.length, filters.category ? 1 : 0].reduce((a, b) => a + b, 0);

  const chips = [
    ...(filters.q ? [{ key: 'q', label: `“${filters.q}”`, clear: () => update({ q: '' }) }] : []),
    ...(filters.minPrice || filters.maxPrice ? [{ key: 'price', label: `${filters.minPrice ? money(filters.minPrice) : '৳0'} – ${filters.maxPrice ? money(filters.maxPrice) : 'any'}`, clear: () => update({ minPrice: '', maxPrice: '' }) }] : []),
    ...filters.size.map((s) => ({ key: `s-${s}`, label: `Size ${s}`, clear: () => update({ size: filters.size.filter((x) => x !== s) }) })),
    ...filters.color.map((c) => ({ key: `c-${c}`, label: c, clear: () => update({ color: filters.color.filter((x) => x !== c) }) })),
  ];

  const panel = (
    <FiltersPanel filters={filters} facets={facets} categoryOptions={categoryOptions} onChange={update} onClear={clearAll} />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28">
          <div className="mb-5">
            <label htmlFor="browser-search" className="sr-only">Search products</label>
            <input id="browser-search" type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search products…" className="h-11 w-full border border-brand-border bg-brand-white px-3 text-sm text-brand-charcoal placeholder:text-brand-muted focus:border-brand-accent focus:outline-none" />
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 lg:hidden">
          <label htmlFor="browser-search-m" className="sr-only">Search products</label>
          <input id="browser-search-m" type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search products…" className="h-11 w-full border border-brand-border bg-brand-white px-3 text-sm text-brand-charcoal placeholder:text-brand-muted focus:border-brand-accent focus:outline-none" />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-muted" aria-live="polite">
            {query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}`}
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setDrawer(true)} className="inline-flex h-11 items-center gap-2 border border-brand-border px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-black lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters{activeCount > 0 && <span className="rounded-full bg-brand-black px-1.5 text-[10px] text-brand-white">{activeCount}</span>}
            </button>
            <label htmlFor="browser-sort" className="sr-only">Sort by</label>
            <select id="browser-sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className="h-11 min-w-0 max-w-[10.5rem] border border-brand-border bg-brand-white px-3 text-sm text-brand-charcoal focus:border-brand-accent focus:outline-none">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button key={chip.key} type="button" onClick={chip.clear} className="inline-flex min-h-[36px] items-center gap-1.5 border border-brand-border bg-brand-white px-3 text-xs text-brand-charcoal hover:border-brand-black">
                {chip.label} <X className="h-3 w-3" />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="min-h-[36px] px-2 text-xs font-semibold text-brand-accent">Clear all</button>
          </div>
        )}

        {query.isLoading ? (
          <SkeletonGrid />
        ) : query.isError ? (
          <div className="grid"><GridMessage title="We couldn't load products." text="Check your connection and try again." action={<button type="button" onClick={() => query.refetch()} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Try again</button>} /></div>
        ) : products.length === 0 ? (
          <div className="grid"><GridMessage title={emptyTitle} text={emptyText} action={(chips.length > 0 || activeCount > 0) && <button type="button" onClick={clearAll} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Clear filters</button>} /></div>
        ) : (
          <>
            <div className={cn('grid grid-cols-2 gap-4 transition-opacity md:grid-cols-3 md:gap-6', query.isPlaceholderData && 'opacity-60')}>
              {products.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
            </div>
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-xs text-brand-muted">Showing {products.length} of {total}</p>
              {query.hasNextPage && (
                <button
                  type="button"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                  className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center border border-brand-black px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white disabled:opacity-50"
                >
                  {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-brand-offwhite">
            <div className="flex items-center justify-between border-b border-brand-border px-5 py-3">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-brand-black">Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters" className="inline-flex h-11 w-11 items-center justify-center text-brand-black"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
            <div className="border-t border-brand-border p-4">
              <button type="button" onClick={() => setDrawer(false)} className="inline-flex min-h-[48px] w-full items-center justify-center bg-brand-black text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-white">
                Show {total} {total === 1 ? 'product' : 'products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
