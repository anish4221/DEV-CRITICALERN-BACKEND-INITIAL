import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'
import articleRoutes from './routes/article.routes.js'
import articleContentRoutes from './routes/articleContent.routes.js'
import articleImageRoutes from './routes/articleImage.routes.js'
import articleCoverRoutes from './routes/articleCover.routes.js'


dotenv.config();
const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://192.168.56.1:3000"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/articles", articleContentRoutes);
app.use("/api/articles", articleImageRoutes);
app.use("/api/articles", articleCoverRoutes);

cloudinary.config({
 cloud_name:process.env.CLOUD_NAME,
 api_key:process.env.CLOUDINARY_API_KEY,
 api_secret:process.env.CLOUDINARY_API_SECRET
})

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;
try {
    await mongoose.connect(mongo_url)
    console.log("Connected successfully")
} catch(error) {
    console.log(error);
}

app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
})