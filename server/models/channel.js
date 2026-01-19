import mongoose, { MongooseError } from "mongoose";

const ChannelSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    squadId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Squad"
    },
    type:{
        type:String,
        enum:["text","post"],
        default:"text"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})


const Channel = mongoose.model("Channel",ChannelSchema)


export default Channel