import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '@/api/client';

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: fetchMeta,
  });
}
