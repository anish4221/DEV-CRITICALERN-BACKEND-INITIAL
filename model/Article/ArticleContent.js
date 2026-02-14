import mongoose from "mongoose";

const articleContentSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },

    editor: {
      type: String,
      enum: ["lexical", "tiptap", "slate"],
      default: "lexical",
    },

    // JSON TREE STRUCTURE
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    isDraft: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ArticleContent", articleContentSchema);
