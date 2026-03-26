import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import cors from 'cors';
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js'
import articleRoutes from './routes/article.routes.js'
import articleContentRoutes from './routes/articleContent.routes.js'
import articleImageRoutes from './routes/articleImage.routes.js'
import articleCoverRoutes from './routes/articleCover.routes.js'
import contactus from './routes/contact.routes.js'
import { requestLogger } from './middleware/logging.js';

dotenv.config();
const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
// Global rate limiter

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,                                        
  handler: (req, res, next, options) => {
    console.log("Too many requests from IP:", req.ip);
    res.status(options.statusCode).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  },
});
app.use(limiter);
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/articles", articleContentRoutes);
app.use("/api/articles", articleImageRoutes);
app.use("/api/articles", articleCoverRoutes);
app.use("/api",contactus);

cloudinary.config({
 cloud_name:process.env.CLOUD_NAME,
 api_key:process.env.CLOUDINARY_API_KEY,
 api_secret:process.env.CLOUDINARY_API_SECRET
})

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;

const startServer = async () => {
  try {
    await mongoose.connect(mongo_url);
    console.log(" Connected successfully");
    console.log(" Connected to DB:", mongoose.connection.name);

    app.listen(port, () => {
      console.log(` Listening on port ${port}`);
    });

  } catch (error) {
    console.error(" Mongo connection failed:", error);
  }
};

startServer();
