export type Pipeline<TWhere, TOrderBy> = {
  where: TWhere;
  skip: number;
  take: number;
  orderBy: TOrderBy;
};

export const withPagination =
  (page = 1, limit = 10) =>
  <TWhere, TOrderBy>(
    pipeline: Pipeline<TWhere, TOrderBy>
  ): Pipeline<TWhere, TOrderBy> => ({
    ...pipeline,
    skip: (page - 1) * limit,
    take: limit,
  });