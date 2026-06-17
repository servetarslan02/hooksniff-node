/**
 * Auto-pagination helper.
 * Wraps a list function to automatically fetch the next page.
 */

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  per_page?: number;
  has_more?: boolean;
}

export class Paginator<T> implements AsyncIterable<T> {
  private currentPage = 1;
  private items: T[] = [];
  private exhausted = false;

  constructor(
    private readonly fetchPage: (page: number, perPage: number) => Promise<T[] | PaginatedResponse<T>>,
    private readonly perPage: number = 50,
  ) {}

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    while (true) {
      if (this.items.length === 0 && !this.exhausted) {
        const response = await this.fetchPage(this.currentPage, this.perPage);
        
        // Handle both array responses and paginated responses
        if (Array.isArray(response)) {
          this.items = response;
          if (this.items.length < this.perPage) {
            this.exhausted = true;
          }
        } else {
          this.items = response.data || [];
          if (this.items.length === 0 || response.has_more === false) {
            this.exhausted = true;
          }
        }
        
        this.currentPage++;
      }

      if (this.items.length === 0) {
        return;
      }

      yield this.items.shift()!;
    }
  }

  async all(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
}

export function paginate<T>(
  fetchPage: (page: number, perPage: number) => Promise<T[] | PaginatedResponse<T>>,
  perPage?: number,
): Paginator<T> {
  return new Paginator(fetchPage, perPage);
}
