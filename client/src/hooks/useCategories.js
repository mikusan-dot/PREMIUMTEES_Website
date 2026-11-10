import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

/** Active categories (display order, with live product counts) straight from the database. */
export const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories || [],
    staleTime: 5 * 60 * 1000,
  });
  return { ...query, categories: query.data || [] };
};

export const FALLBACK_CATEGORY_IMAGE =
  'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800';
