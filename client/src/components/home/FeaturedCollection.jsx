import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ProductSection } from '@/components/home/ProductSection';

/** Spotlights the first visible collection (by admin sort order) that has products. Hidden when there is none. */
export const FeaturedCollection = () => {
  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => (await api.get('/collections')).data.collections || [],
    staleTime: 5 * 60 * 1000,
  });
  const featured = collections.find((c) => c.productCount > 0);

  const { data, isLoading } = useQuery({
    queryKey: ['collection', featured?.slug],
    queryFn: async () => (await api.get(`/collections/${encodeURIComponent(featured.slug)}`)).data,
    enabled: Boolean(featured),
    staleTime: 5 * 60 * 1000,
  });

  if (!featured) return null;
  const products = (data?.products || []).slice(0, 4);
  if (!isLoading && products.length === 0) return null;

  return (
    <ProductSection
      eyebrow="Featured collection"
      title={`${featured.name}.`}
      description={featured.description || 'A curated edit from the studio.'}
      products={products}
      isLoading={isLoading}
      viewAllHref={`/collections/${featured.slug}`}
      viewAllLabel="View collection"
      className="border-t border-white/10 dark:border-white/10 bg-brand-white"
    />
  );
};
