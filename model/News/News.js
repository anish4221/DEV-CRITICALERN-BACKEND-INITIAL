import mongoose from "mongoose";


const newsSchema = new mongoose.Schema({
    author:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        index : true
    },
    title : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    slug : {
        type : String,
        required : true,
        trim : true,
        unique : true,
        index : true,

    },
    content : {
        type : String,
        required : true,
        trim : true,
        maxlength : 500,
        
    },
    tags : [{type : String, lowercase : true, index : true}],
}, { timestamps : true })

const News = mongoose.model("News", newsSchema);

export default News;
