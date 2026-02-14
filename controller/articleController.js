import Article from "../model/Article/Article.js";
import ArticleContent from "../model/Article/ArticleContent.js";

export const createArticle = async (req, res) => {
  try {
    const { title, slug, description, category, tags } = req.body;

    // 1️⃣ Create Article FIRST (without contentId)
    const article = await Article.create({
      title,
      slug,
      description,
      category,
      tags,
      author: req.user._id,
      isPublished: false
    });

    // 2️⃣ Create empty content WITH articleId
    const content = await ArticleContent.create({
      articleId: article._id,
      content: { root: { children: [] } }
    });

    // 3️⃣ Update article with contentId
    article.contentId = content._id;
    await article.save();

    res.status(201).json(article);

  } catch (error) {
    res.status(500).json({
      message: "Article creation failed",
      error: error.message
    });
  }
};


export const saveAsDraft = async (req, res) => {
  const article = req.article; // middleware se aayega

  article.isPublished = false;
  article.publishedAt = null;

  await article.save();

  res.json({ message: "Saved as draft" });
};

export const publishArticle = async (req, res) => {
  const article = req.article;

  article.isPublished = true;
  article.publishedAt = new Date();

  await article.save();

  res.json({ message: "Article published" });
};


export const getArticleBySlug = async (req, res) => {
  const { slug } = req.params;

  const article = await Article.aggregate([
    { $match: { slug } },

    {
      $lookup: {
        from: "articlecontents",
        localField: "contentId",
        foreignField: "_id",
        as: "content",
      },
    },

    {
      $lookup: {
        from: "articlecoverimages",
        localField: "coverImageId",
        foreignField: "_id",
        as: "coverImage",
      },
    },

    {
      $lookup: {
        from: "articleimages",
        localField: "_id",
        foreignField: "articleId",
        as: "images",
      },
    },

    { $unwind: "$content" },
  ]);

  res.json(article[0]);
};
