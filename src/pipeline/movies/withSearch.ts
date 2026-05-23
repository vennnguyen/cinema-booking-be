
import { MoviePipeline } from ".";
export const withSearch =
  (search?: string) =>
  (pipeline: MoviePipeline): MoviePipeline => {
    if (!search) return pipeline;
    return {
      ...pipeline,
      where: {
        ...pipeline.where,
        OR: [
          { movieName: { contains: search } },
          { director: { contains: search } },
          { producer: { contains: search } },
        ],
      },
    };
  };
