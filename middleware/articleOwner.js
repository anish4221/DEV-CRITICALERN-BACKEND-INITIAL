import Article from "../model/Article/Article.js";

export const isArticleOwner = async (req, res, next) => {
  const { articleId } = req.params;
  console.log("Checking article ownership for article ID:", articleId);

  // article fetch
  const article = await Article.findById(articleId);
  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  // ownership check
  if (article.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Access denied" });
  }

  // attach article to request (reuse in controller)
  req.article = article;

  next();
};
