import { Prisma } from "@prisma/client";

export type MoviePipeline = {
  where: Prisma.movieWhereInput;
  skip: number;
  take: number;
  orderBy: Prisma.movieOrderByWithRelationInput;
};
import { withPagination } from "../core/pagination";
import { withSearch }     from "./withSearch";
import { withMovieType }  from "./withMovieType";
import { withStatus }     from "./withStatus";


export type MovieFilterParams = {
  search?      : string;
  movieTypeId? : number;
  status?      : "all" | "showing" | "upcoming" | "ended";
  page?        : number;
  limit?       : number;
};

const initial: MoviePipeline = {
  where:   {},
  skip:    0,
  take:    5,
  orderBy: { createdAt: "desc" },
};

export const buildMoviePipeline = (params: MovieFilterParams): MoviePipeline => {
  const pipes = [
    withSearch(params.search),
    withMovieType(params.movieTypeId),
    withStatus(params.status),
    withPagination(params.page, params.limit),
  ];

  return pipes.reduce((pipeline, pipe) => pipe(pipeline), initial);
};