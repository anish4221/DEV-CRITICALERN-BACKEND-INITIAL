import ArticleCoverImage from "../model/Article/ArticleCoverImage.js";
import { v2 as cloudinary } from "cloudinary";
export const uploadCoverImage = async (req, res) => {
  try {
    const article = req.article;

    if (!req.file) {
      return res.status(400).json({
        message: "Cover image file is required",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "articles/cover-images",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // Check if cover already exists
    let cover = await ArticleCoverImage.findOne({
      articleId: article._id,
    });

    if (!cover) {
      cover = await ArticleCoverImage.create({
        articleId: article._id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        alt: req.body.alt || "",
      });
    } else {
      cover.url = uploadResult.secure_url;
      cover.width = uploadResult.width;
      cover.height = uploadResult.height;
      cover.alt = req.body.alt || "";
      await cover.save();
    }

    res.status(201).json({
      imageId: cover._id,
      url: cover.url,
    });

  } catch (error) {
    res.status(500).json({
      message: "Cover upload failed",
      error: error.message,
    });
  }
};

