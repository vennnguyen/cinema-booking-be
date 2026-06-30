import { uploadImage } from "@/helper/cloudinary";
import express from "express";
import multer  from "multer";


const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage() }); // giữ file trong RAM

router.post(
    "/movies",
    upload.fields([
        { name: "imagePortrait",  maxCount: 1 },
        { name: "imageLandscape", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const files = req.files as Record<string, Express.Multer.File[]>;

            const [imagePortraitUrl, imageLandscapeUrl] = await Promise.all([
                files.imagePortrait?.[0]  ? uploadImage(files.imagePortrait[0])  : null,
                files.imageLandscape?.[0] ? uploadImage(files.imageLandscape[0]) : null,
            ]);

            const movieData = {
                ...req.body,
                imagePortrait:  imagePortraitUrl,
                imageLandscape: imageLandscapeUrl,
            };

            console.log("📦 Movie data:", movieData);

            // lưu vào DB ở đây
            // await MovieModel.create(movieData);

            res.json({ success: true, data: movieData });
        } catch (err) {
            res.status(500).json({ success: false, message: "Upload thất bại" });
        }
    }
);