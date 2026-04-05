import News from "../../model/News/News.js";
import NewsImage from "../../model/News/NewsImage.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

export const createNews = async (req, res) => {
    try {
        const author = req.user._id;  
        const { title, content, tags } = req.body;
        
        // Input validation
        if (!title || !content) {
            return res.status(400).json({ 
                error: "Title and content are required" 
            });
        }
        
        // Generate slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        // Check if slug already exists
        const existingNews = await News.findOne({ slug });
        if (existingNews) {
            return res.status(400).json({ 
                error: "A news article with this title already exists" 
            });
        }

        const news = await News.create({
            author,
            title,
            slug,
            content,
            tags: tags || [],
        });

        res.status(201).json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error("Create news error:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to create news" 
        });
    }
};

export const createNewsImage = async (req, res) => {
    try {
        const newsId = req.params.newsId;
        
        // Validate news exists
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ 
                success: false,
                error: "News article not found" 
            });
        }

        // Check if only 1 image is uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: "Image file is required" 
            });
        }

        if (req.files.length > 1) {
            return res.status(400).json({ 
                success: false,
                error: "Only one image allowed per news article" 
            });
        }

        // Check if image already exists for this news
        const existingImage = await NewsImage.findOne({ newsId });
        if (existingImage) {
            return res.status(400).json({ 
                success: false,
                error: "Image already exists for this news article. Delete the existing image first." 
            });
        }

        const file = req.files[0];

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "image",
                    folder: "news/editor-images",
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        // Save image record in DB
        const newsImage = await NewsImage.create({
            newsId,
            url: uploadResult.secure_url,
            altText: req.body.altText || news.title, // Use news title as default alt text
            // Remove width/height if not in schema
        });

        res.status(201).json({
            success: true,
            data: {
                imageId: newsImage._id,
                url: newsImage.url,
                altText: newsImage.altText
            }
        });
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({
            success: false,
            error: "Image upload failed",
            details: error.message
        });
    }
};
