import { $Enums } from "@prisma/client";
import { MoviePipeline } from ".";

export const withStatus = (status?: string) => (pipeline: MoviePipeline): MoviePipeline => {
    if (!status || status === "all") return pipeline;

    const validStatuses = Object.values($Enums.movie_status);
    if (!validStatuses.includes(status as $Enums.movie_status)) return pipeline;

    return {
        ...pipeline,
        where: {
            ...pipeline.where,
            status: status as $Enums.movie_status,
        },
    };
};