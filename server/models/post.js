import mongoose from "mongoose";
const PostSchema = new mongoose.Schema({

    content:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    squadId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Squad",
        required:true
    },
    channelId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Channel",
        required:true
    }
},{timestamps:true})


const Post = new mongoose.model("Post",PostSchema)
export default Post