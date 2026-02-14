import mongoose from "mongoose";

const articleCoverImageSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      unique: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
    },

    alt: String,
    width: Number,
    height: Number,
  },
  { timestamps: true }
);

export default mongoose.model("ArticleCoverImage", articleCoverImageSchema);
