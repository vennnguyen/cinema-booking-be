import prisma from "config/prisma";
import { buildMoviePipeline, MovieFilterParams } from "../pipeline/movies";
import { uploadImage } from "@/helper/cloudinary";

const getProductService = async () => {
  const data = await prisma.movie.findMany({
    include: {
      movietype: {
        select: {
          movieTypeName: true,
        },
      },
    },
  });
  return data;
};
const getProductBySlugService = async (slug: string) => {
  const data = await prisma.movie.findFirst({
    where: {
      slug,
    },
    include: {
      movietype: {
        select: {
          movieTypeName: true,
        },
      },
    },
  });
  return data;
};

 const getMovies = async (params: MovieFilterParams) => {
  const filter = buildMoviePipeline(params);

  const [data, total] = await Promise.all([
    prisma.movie.findMany({
      ...filter,
      include: {
        movietype: {
          select: { movieTypeId: true, movieTypeName: true },
        },
      },
    }),
    prisma.movie.count({ where: filter.where }),
  ]);

  const limit = params.limit ?? 10;
  const page  = params.page  ?? 1;
  const movieType = await prisma.movietype.findMany();
  return {
    data,
    movieType,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const createMovieService = async (
    body: {
        movieTypeId:  string;
        movieName:    string;
        description?: string;
        age?:         string;
        startDate?:   string;
        endDate?:     string;
        slug?:        string;
        trailer?:     string;
        duration:     string;
        country?:     string;
        producer?:    string;
        director?:    string;
        actors?:      string;
        status:       "showing" | "upcoming" | "ended";
    },
    files: {
        imagePortrait?:  Express.Multer.File[];
        imageLandscape?: Express.Multer.File[];
    }
) => {
    const [imagePortraitUrl, imageLandscapeUrl] = await Promise.all([
        files.imagePortrait?.[0]  ? uploadImage(files.imagePortrait[0])  : Promise.resolve(undefined),
        files.imageLandscape?.[0] ? uploadImage(files.imageLandscape[0]) : Promise.resolve(undefined),
    ]);

    const movie = await prisma.movie.create({
      data: {
        movieTypeId:    Number(body.movieTypeId),
        movieName:      body.movieName,
        description:    body.description,
        age:            body.age ? Number(body.age) : undefined,
        startDate:      body.startDate ? new Date(body.startDate) : undefined,
        endDate:        body.endDate   ? new Date(body.endDate)   : undefined,
        slug:           body.slug,
        trailer:        body.trailer,
        duration:       Number(body.duration),
        country:        body.country,
        producer:       body.producer,
        director:       body.director,
        actors:         body.actors ? body.actors.split(",").map((a) => a.trim()) : undefined,
        status:         body.status,
        imagePortrait:  imagePortraitUrl,
        imageLandscape: imageLandscapeUrl,
    }
    });

    return movie;
};
export { getProductService, getProductBySlugService, getMovies,createMovieService };
