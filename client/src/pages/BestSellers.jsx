import { ProductListingPage } from '@/components/product/ProductListingPage';

export const BestSellers = () => (
  <ProductListingPage
    title="Best Sellers"
    subtitle="The pieces our customers keep coming back to."
    queryKey="best-sellers"
    params={{ bestSellers: true, limit: 24 }}
    emptyTitle="Best sellers will appear here."
    emptyText="They are ranked from real orders, so check back after our first sales."
  />
);
export default BestSellers;
