export interface Page<T> {
  items: T[];
  total: number;
  nextCursor: string | null;
}

export const encodeCursor = (index: number): string =>
  Buffer.from(String(index), "utf8").toString("base64url");

export const decodeCursor = (cursor: string | null | undefined): number => {
  const parsed = Number.parseInt(Buffer.from(cursor ?? "", "base64url").toString("utf8"), 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const pageOf = <T>(items: T[], limit: number, start: number): Page<T> => ({
  items: items.slice(start, start + limit),
  total: items.length,
  nextCursor: start + limit < items.length ? encodeCursor(start + limit) : null,
});

export const paginate = <T>(
  items: T[],
  limit: number,
  cursor?: string | null,
): Page<T> => pageOf(items, limit, decodeCursor(cursor));
