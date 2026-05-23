import cloudinary from "@/config/cloudinary";


export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "movies" }, // ảnh sẽ lưu vào folder "movies" trên cloudinary
            (error, result) => {
                if (error || !result) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });
};