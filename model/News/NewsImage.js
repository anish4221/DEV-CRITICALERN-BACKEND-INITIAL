import mongoose from "mongoose";

const newsImageSchema = new mongoose.Schema({
    newsId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "News",
        required : true,
        index : true  // Keep this - needed for querying images by news
    },
    url : {
        type : String,
        required : true,
        trim : true,  // Remove whitespace
        validate: {   // Validate URL format
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid URL format'
        }
    },
}, {timestamps : true});

const NewsImage = mongoose.model("NewsImage", newsImageSchema);

export default NewsImage;