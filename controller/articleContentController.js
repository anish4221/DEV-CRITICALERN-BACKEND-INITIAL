import ArticleContent from "../model/Article/ArticleContent.js";
import Article from "../model/Article/Article.js";

export const saveContent = async (req, res) => {
  const article = req.article;
  const { content } = req.body;

  const articleContent = await ArticleContent.findById(article.contentId);

  articleContent.content = content;
  articleContent.version += 1;

  await articleContent.save();

  res.json({ message: "Content saved successfully" });
};
export const getContent = async (req, res) => {
  const article = req.article;

  //const articleContent = await ArticleContent.findById(article.contentId);
  const articleContent = await ArticleContent.aggregate([
    { $match: { articleId: article._id } },
    {
      $lookup: {
        from: "articles",
        localField: "articleId",
        foreignField: "_id",
        as: "article",
      },
    },

    { $unwind: "$article" },
    {
      $project: {
        title: "$article.title",
        content: 1,
        version: 1,
      },
    },
  ]); 

  res.json({
      success: true,
      message: "Content retrieved successfully",
      data: articleContent
  });
};




