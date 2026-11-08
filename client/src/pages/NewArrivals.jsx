import { ProductListingPage } from '@/components/product/ProductListingPage';

export const NewArrivals = () => (
  <ProductListingPage
    title="New Arrivals"
    subtitle="Fresh drops, newest first."
    queryKey="new-arrivals"
    params={{ newArrivals: true, limit: 24 }}
    emptyTitle="No new arrivals yet."
    emptyText="New pieces are on the way — check back soon."
  />
);
export default NewArrivals;
