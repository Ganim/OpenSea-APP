/**
 * Unified Pagination Types
 *
 * O backend usa `perPage` em alguns endpoints e `limit` em outros.
 * Este arquivo centraliza a definicao de paginacao para todo o frontend.
 */

/**
 * Tipo unificado de metadados de paginacao.
 * Cobre ambos os formatos retornados pelo backend.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  /** Itens por pagina (normalizado de `limit` ou `perPage`) */
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Formato bruto do backend que pode usar `perPage` ou `limit`.
 */
interface RawPaginationMeta {
  total: number;
  page: number;
  limit?: number;
  perPage?: number;
  totalPages?: number;
  pages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Normaliza a resposta de paginacao do backend para o formato unificado.
 * Aceita tanto `limit` quanto `perPage`, e `totalPages` quanto `pages`.
 */
export function normalizePagination(raw: RawPaginationMeta): PaginationMeta {
  const limit = raw.limit ?? raw.perPage ?? 20;
  const totalPages =
    raw.totalPages ?? raw.pages ?? Math.ceil(raw.total / limit);

  return {
    total: raw.total,
    page: raw.page,
    limit,
    totalPages,
    hasNext: raw.hasNext ?? raw.page < totalPages,
    hasPrev: raw.hasPrev ?? raw.page > 1,
  };
}

/**
 * Query params de paginacao padrao para enviar ao backend.
 */
export interface PaginatedQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Resposta paginada generica.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
