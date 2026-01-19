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
    },
    attachments:[
        {
        type:String,
        default:''
    }
]
},{timestamps:true})

PostSchema.index({ channelId: 1, createdAt: -1 });

const Post = mongoose.model("Post",PostSchema)
export default Post