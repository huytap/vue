export interface MetaLink {
  url: string | null;
  label: string;
  active: boolean;
}
export interface PaginationLink {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}
export interface PaginationMeta{
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: MetaLink[];
}
// Interface chính cho phản hồi từ API
export interface PaginatedResponse<T> {
  data: T[]; // T là kiểu dữ liệu linh hoạt (User, Product,...)
  meta: PaginationMeta,
  links: PaginationLink
}
// Sort order
export type SortOrder = 'asc' | 'desc';
// Base Filter
export interface BaseFilters {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: SortOrder;
}
/**
 * Convert filter params to query string
 */
export function filterParamsToQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

/**
 * Clean filter params (remove empty values)
 */
export function cleanFilterParams<T extends Record<string, any>>(params: T): Partial<T> {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length === 0) {
        return acc;
      }
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Merge filter params
 */
// export function mergeFilterParams<T extends BaseFilters>(
//   ...params: Partial<T>[]
// ): T {
//   return params.reduce((acc, curr) => {
//     return { ...acc, ...cleanFilterParams(curr) };
//   }, {} as T);
// }