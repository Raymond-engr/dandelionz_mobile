import { useCallback, useEffect, useRef, useState } from "react";

type PageInfo<T> = {
  results: T[];
  next: string | null;
};

type QueryResult<TData> = {
  data?: TData;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch?: () => void;
};

// Most paginated endpoints in this app wrap DRF's paginated response in
// {success, data: {count, next, previous, results}}. AdminUserListView is
// the one exception - its paginated branch returns the DRF envelope
// directly with no outer wrapper (see lib/api/adminApi.ts getAllUsers).
// selectPage lets each call site describe its own shape instead of this
// hook assuming one.
export function selectStandardEnvelope<T>(
  data:
    | {
        data?: { results: T[]; next: string | null };
      }
    | undefined,
): PageInfo<T> {
  return { results: data?.data?.results ?? [], next: data?.data?.next ?? null };
}

export function selectBareEnvelope<T>(
  data: { results: T[]; next: string | null } | undefined,
): PageInfo<T> {
  return { results: data?.results ?? [], next: data?.next ?? null };
}

// A third shape: AdminFinanceViewSet.list_refunds keeps its historical flat
// response ({success, data: T[], count, pending_count}) rather than the
// nested envelope, since pending_count sits alongside data rather than
// inside it. `next`/`previous` were added at this same top level.
export function selectFlatEnvelope<T>(
  data: { data?: T[]; next?: string | null } | undefined,
): PageInfo<T> {
  return { results: data?.data ?? [], next: data?.next ?? null };
}

/**
 * Drives infinite-scroll ("load more as you reach the bottom") over any RTK
 * Query endpoint that returns pages of results and is configured with the
 * serializeQueryArgs/merge pattern (see getProducts, getAllUsers,
 * getVendorOrdersList) so successive pages accumulate into one growing
 * cached list instead of being cached as separate results.
 *
 * `filterArgs` should NOT include `page` - this hook owns paging. Pass an
 * object identity that only changes when the filters themselves change
 * (e.g. category, search, status) so the page resets to 1 automatically
 * when the user changes a filter rather than continuing to append to a
 * now-stale list.
 */
export function useInfiniteList<T, A extends object, TData>(
  useQueryHook: (
    args: A & { page: number },
    options?: { skip?: boolean },
  ) => QueryResult<TData>,
  filterArgs: A,
  selectPage: (data: TData | undefined) => PageInfo<T>,
  options?: { skip?: boolean },
) {
  const [page, setPage] = useState(1);
  const skip = options?.skip ?? false;

  const filterKey = JSON.stringify(filterArgs);
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setPage(1);
    }
  }, [filterKey]);

  const result = useQueryHook({ ...filterArgs, page }, { skip });
  const { results: items, next } = selectPage(result.data);

  const hasMore = !!next;
  const isFetchingMore = result.isFetching && page > 1;
  const isInitialLoading = result.isLoading && page === 1;

  const loadMore = useCallback(() => {
    if (hasMore && !result.isFetching) {
      setPage((p) => p + 1);
    }
  }, [hasMore, result.isFetching]);

  // For pull-to-refresh. Resets to page 1 (so any pages beyond the first
  // are dropped) and calls the underlying query's own refetch, since RTK
  // Query otherwise treats an unchanged arg (still page 1) as already
  // cached and skips the network call.
  const refresh = useCallback(async () => {
    setPage(1);
    await result.refetch?.();
  }, [result]);

  return {
    items,
    rawData: result.data,
    hasMore,
    isFetchingMore,
    isInitialLoading,
    loadMore,
    refresh,
    error: result.error,
  };
}
