import Article from "../model/Article/Article.js";
import ArticleContent from "../model/Article/ArticleContent.js";

export const createArticle = async (req, res) => {
  try {
    const { title, slug, description, category, tags,name } = req.body;

    // 1️ Create Article FIRST (without contentId)
    const article = await Article.create({
      title,
      slug,
      description,
      category,
      tags,
      author: req.user._id,
      isPublished: false
    });

    // 2️ Create empty content WITH articleId
    const content = await ArticleContent.create({
      articleId: article._id,
      content: { root: { children: [] } }
    });

    // 3️ Update article with contentId
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


export const getLatestCoverArticles = async (req, res) => {
  console.log("getLatestCoverArticles HIT 🔥");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const articles = await Article.aggregate([
      {
        $sort: { createdAt: -1 }   // 1 = ascending, -1 = descending
      },
      // Pagination
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "articlecoverimages",
          localField: "_id",
          foreignField: "articleId",
          as: "coverImage"
        }
      },
      {
        $unwind: {
          path: "$coverImage",
          preserveNullAndEmptyArrays: true
        }
      },
       // 4️ Select only required fields
      {
        $project: {
          _id: 0,                    // remove _id (optional)
          title: 1,
          slug: 1,
          description: 1,
          createdAt: 1,
          image: "$coverImage.url"   // rename field
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: articles
    });


  } catch (error) {res.status(500).json({
      success: false,
      message: error.message
  });
}
};




export const getArticleBySlug = async (req, res) => {
  const { slug } = req.params;

  const article = await Article.aggregate([
    { $match: { slug } },

    {
      $lookup: {
        from: "articlecontents",
        localField: "_id",
        foreignField: "articleId",
        as: "content",
      },
    },

    {
      $lookup: {
        from: "articlecoverimages",
        localField: "_id",
        foreignField: "articleId",
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
