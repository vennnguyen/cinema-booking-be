import express from "express";
import {
  createMovieController,
  getMoviesHandler,
  getProductBySlugController,
  updateMovieController,

} from "controllers/product.controller";
import multer from "multer";
const router = express.Router();

router.get("/", getMoviesHandler);
router.get("/:slug", getProductBySlugController);

const upload = multer({ storage: multer.memoryStorage() });
router.post(
    "/",
    upload.fields([
        { name: "imagePortrait",  maxCount: 1 },
        { name: "imageLandscape", maxCount: 1 },
    ]),
    createMovieController
);
router.put("/:slug", upload.fields([
    { name: "imagePortrait",  maxCount: 1 },
    { name: "imageLandscape", maxCount: 1 },
]), updateMovieController);


export default router;
