import ArticleContent from "../model/Article/ArticleContent.js";

export const saveContent = async (req, res) => {
  const article = req.article;
  const { content } = req.body;

  const articleContent = await ArticleContent.findById(article.contentId);

  articleContent.content = content;
  articleContent.version += 1;

  await articleContent.save();

  res.json({ message: "Content saved successfully" });
};
