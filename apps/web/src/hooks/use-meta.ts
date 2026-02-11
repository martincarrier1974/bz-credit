import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '@/api/client';

export function useMeta(enabled = true) {
  return useQuery({
    queryKey: ['meta'],
    queryFn: fetchMeta,
    enabled,
  });
}
