import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

/** Exported so logout can clear it; history is per-device, not per-account. */
export const RECENT_SEARCHES_KEY = "recentSearches";
const STORAGE_KEY = RECENT_SEARCHES_KEY;
export const MAX_RECENT = 8;

/**
 * Read a stored history blob, tolerating anything that isn't a string array.
 *
 * Exported for tests: the hook itself is thin glue around this and `addTerm`.
 */
export function parseStoredRecents(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/** Newest first, case-insensitively deduped, capped at MAX_RECENT. */
export function addTerm(current: string[], term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return current;

  const withoutDuplicate = current.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase(),
  );
  return [trimmed, ...withoutDuplicate].slice(0, MAX_RECENT);
}

/**
 * Recently submitted search terms, persisted on the device.
 *
 * Deliberately local-only: search history is not worth a round trip, and
 * keeping it off the server avoids storing query history against an account.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        setRecent(parseStoredRecents(raw));
      })
      // A corrupt or unreadable entry should degrade to "no history", never
      // take down the search screen.
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: string[]) => {
    setRecent(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addRecent = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;

      setRecent((current) => {
        const next = addTerm(current, trimmed);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const removeRecent = useCallback(
    (term: string) => {
      persist(recent.filter((item) => item !== term));
    },
    [recent, persist],
  );

  const clearRecent = useCallback(() => persist([]), [persist]);

  return { recent, addRecent, removeRecent, clearRecent };
}
