import { MoviePipeline } from ".";

export const withMovieType = (movieTypeId? :number) => (pipeline: MoviePipeline): MoviePipeline => {
    if (!movieTypeId) return pipeline;
    return {
        ...pipeline,
        where: {
            ...pipeline.where,
            movieTypeId: movieTypeId
        }
    }
}