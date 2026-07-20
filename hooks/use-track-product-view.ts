import { useRecordInteractionMutation } from "@/lib/api/publicApi";
import { useEffect, useRef } from "react";

/**
 * Report that the viewer opened a product page.
 *
 * Strictly fire-and-forget. The recommender is a nice-to-have, so a failed or
 * slow event must never block a render, surface a toast, or reject into an
 * unhandled promise — the catch here is the whole error policy.
 *
 * Guarded by a ref rather than relying on the effect's dependency list alone:
 * the effect re-runs under StrictMode's double-invoke and after any remount
 * that keeps the same slug, and one screen open should count as one view.
 */
export function useTrackProductView(slug: string | undefined) {
  const [recordInteraction] = useRecordInteractionMutation();
  const lastTracked = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!slug || lastTracked.current === slug) return;
    lastTracked.current = slug;

    recordInteraction({ product: slug, event_type: "view" })
      .unwrap()
      .catch(() => {});
  }, [slug, recordInteraction]);
}
