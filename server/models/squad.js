import mongoose, { mongo } from "mongoose";
import User from "./user.js";

const SquadSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    members:[
       {

        user:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        },
        role:{
            type:String,
            enum:["admin","moderator","member"],
            default:"member",
            required:true
        }

       }
    ],
    channels:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Channel"
    }],
    inviteCode:{
        type:String,
        required:true,
        unique:true,
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        default:""
    }
},{timestamps:true})

const Squad = mongoose.model("Squad",SquadSchema)

export default Squad