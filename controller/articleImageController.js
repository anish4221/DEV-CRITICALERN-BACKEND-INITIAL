import ArticleImage from "../model/Article/ArticleImage.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
export const uploadEditorImage = async (req, res) => {
  try {
    const { articleId } = req.params;
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image file is required" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "articles/editor-images",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(file.buffer);
      });
    });
    const cloudinaryResponses = await Promise.all(uploadPromises);

    // Save each image record in DB
    const images = await Promise.all(
      cloudinaryResponses.map((response) =>
        ArticleImage.create({
          articleId,
          url: response.secure_url,
          alt: req.body.alt, // optional alt text, could be extended per image
          width: response.width,
          height: response.height,
        }),
      ),
    );

    res.status(201).json({
      uploaded: images.map((img) => ({
        imageId: img._id,
        url: img.url,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};
