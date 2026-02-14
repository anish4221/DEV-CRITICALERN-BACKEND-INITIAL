import mongoose from "mongoose";

const articleImageSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
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

export default mongoose.model("ArticleImage", articleImageSchema);
