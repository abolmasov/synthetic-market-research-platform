/**
 * Shared pagination types used across domain, application, and presentation layers.
 */

/** Input options accepted by paginated repository methods. */
export interface PaginationOptions {
  page: number;
  limit: number;
  /** When set, repository queries are scoped to this workspace. */
  workspaceId?: string;
}

/** Shape returned by paginated repository methods. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Compute totalPages from total count and limit. */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
