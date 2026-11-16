"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value`, but only after it has stopped changing for `delayMs`.
 * Typing "beatles" quickly produces one search instead of seven.
 *
 * Closure note: each run of the effect creates a NEW arrow function that
 * "remembers" the `value` from that render (its backpack). The cleanup
 * cancels the previous timer, so only the newest backpack ever gets used.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
