import News from "../model/News/News.js";

export const isNewsOwner = async (req, res, next) =>{
    const {newsId} = req.params;
    console.log("Checking news ownership for news ID:", newsId);

    const news = await News.findById(newsId);

    if(!news){
        return res.status(404).json({message: "News not found"});
    }

    if(news.author.toString() !== req.user._id.toString()){
        return res.status(403).json({message: "Access denied"});
    }   
    req.news = news;
    next();
};