/**
 * Pagination Helper for HookSniff Node.js SDK.
 *
 * Provides automatic cursor-based pagination for list() methods.
 *
 * Usage:
 *   // Auto-paginate through all items
 *   for await (const msg of hs.message.listAll()) {
 *     console.log(msg);
 *   }
 *
 *   // Manual pagination
 *   const page = await hs.message.list({ limit: 100 });
 *   for (const msg of page.data) {
 *     console.log(msg);
 *   }
 *   if (!page.done) {
 *     const nextPage = await hs.message.list({ iterator: page.iterator });
 *   }
 */

/** Generic list response with pagination support */
export interface ListResponse<T> {
  data: T[];
  done: boolean;
  iterator: string | null;
  prevIterator?: string | null;
}

/** Options for list methods */
export interface ListOptions {
  limit?: number;
  iterator?: string | null;
}

/**
 * Create an async iterable that auto-paginates through all items.
 *
 * @param fetchPage - Function that fetches a page given an iterator
 * @param options - Initial list options (limit, etc.)
 * @returns AsyncIterable of individual items
 *
 * @example
 * ```ts
 * const listAll = createPaginator(
 *   (opts) => hs.message.list(opts),
 *   { limit: 100 }
 * );
 *
 * for await (const msg of listAll) {
 *   console.log(msg.id);
 * }
 * ```
 */
export function createPaginator<T>(
  fetchPage: (options: ListOptions) => Promise<ListResponse<T>>,
  options?: ListOptions
): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      let currentPromise: Promise<ListResponse<T>> | null = null;
      let currentIndex = 0;
      let done = false;
      let currentIterator: string | null = options?.iterator ?? null;

      return {
        async next(): Promise<IteratorResult<T>> {
          if (done) {
            return { done: true, value: undefined };
          }

          // Fetch page if we don't have one
          if (currentPromise === null) {
            currentPromise = fetchPage({
              limit: options?.limit,
              iterator: currentIterator,
            });
            currentIndex = 0;
          }

          const page = await currentPromise;

          // Return items from current page
          if (currentIndex < page.data.length) {
            const item = page.data[currentIndex];
            currentIndex++;
            return { done: false, value: item };
          }

          // Move to next page
          if (!page.done && page.iterator) {
            currentIterator = page.iterator;
            currentPromise = fetchPage({
              limit: options?.limit,
              iterator: currentIterator,
            });
            currentIndex = 0;

            // Recurse to get next item
            return this.next();
          }

          // All done
          done = true;
          return { done: true, value: undefined };
        },
      };
    },
  };
}

/**
 * Helper to iterate over all pages (not just items).
 *
 * @param fetchPage - Function that fetches a page given an iterator
 * @param options - Initial list options
 * @returns AsyncIterable of pages
 *
 * @example
 * ```ts
 * for await (const page of paginate(hs.message.list.bind(hs.message))) {
 *   console.log(`Got ${page.data.length} items, done: ${page.done}`);
 * }
 * ```
 */
export async function* paginate<T>(
  fetchPage: (options: ListOptions) => Promise<ListResponse<T>>,
  options?: ListOptions
): AsyncGenerator<ListResponse<T>> {
  let iterator: string | null = options?.iterator ?? null;

  while (true) {
    const page = await fetchPage({
      limit: options?.limit,
      iterator,
    });

    yield page;

    if (page.done || !page.iterator) {
      break;
    }

    iterator = page.iterator;
  }
}
