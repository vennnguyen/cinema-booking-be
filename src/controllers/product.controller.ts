import { Request, Response } from "express";
import {
  createMovieService,
  getMovies,
  getProductBySlugService,
  getProductService,
} from "services/product.service";



const getProductController = async (req: Request, res: Response) => {
  try {
    const data = await getProductService();
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim", error);
    return res.status(500);
  }
};
const getProductBySlugController = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const data = await getProductBySlugService(slug as string);
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy phim theo slug", error);
    return res.status(500);
  }
};

 const getMoviesHandler = async (req: Request, res: Response) => {
  try {
    const {
      search,
      movieTypeId,
      status,
      page  = "1",
      limit = "10",
    } = req.query;

    const result = await getMovies({
      search      : search as string,
      movieTypeId : movieTypeId ? Number(movieTypeId) : undefined,
      status      : status as "all" | "showing" | "upcoming" | "ended",
      page        : Number(page),
      limit       : Number(limit),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};
const createMovieController = async (req: Request, res: Response) => {
    try {
        const {
            movieTypeId, movieName, duration, status,
            startDate, endDate, age, slug,
        } = req.body;
        if (!movieName?.trim()) {
            res.status(400).json({ success: false, message: "Tên phim là bắt buộc" });
            return;
        }
        if (!movieTypeId || isNaN(Number(movieTypeId))) {
            res.status(400).json({ success: false, message: "Thể loại phim là bắt buộc" });
            return;
        }
        if (!duration || isNaN(Number(duration)) || Number(duration) < 1) {
            res.status(400).json({ success: false, message: "Thời lượng phải lớn hơn 0" });
            return;
        }
        if (!status || !["showing", "upcoming", "ended"].includes(status)) {
            res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
            return;
        }
        if (!startDate) {
            res.status(400).json({ success: false, message: "Ngày bắt đầu là bắt buộc" });
            return;
        }
        if (!endDate) {
            res.status(400).json({ success: false, message: "Ngày kết thúc là bắt buộc" });
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            res.status(400).json({ success: false, message: "Ngày kết thúc phải sau ngày bắt đầu" });
            return;
        }
        if (age !== undefined && age !== "" && (isNaN(Number(age)) || Number(age) < 0)) {
            res.status(400).json({ success: false, message: "Độ tuổi không hợp lệ" });
            return;
        }

        const files = req.files as Record<string, Express.Multer.File[]>;

        const movie = await createMovieService(req.body, {
            imagePortrait:  files?.imagePortrait,
            imageLandscape: files?.imageLandscape,
        });

        res.status(201).json({ success: true, data: movie });
    } catch (error) {
        console.error("createMovie error:", error);
        res.status(500).json({ success: false, message: "Tạo phim thất bại" });
    }
};


export { getProductController, getProductBySlugController,createMovieController,getMoviesHandler };
