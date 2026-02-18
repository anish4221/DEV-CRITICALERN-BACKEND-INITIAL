import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 200,
    },

    // Active editor content
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArticleContent",
      default: null,
      index: true,
    },

    // Cover image reference
    coverImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArticleCoverImage",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // authorName: {
    //   type: String,
    //   required: true,
    // },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    tags: [{ type: String, lowercase: true, index: true }],

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
