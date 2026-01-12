import mongoose from "mongoose";
import Squad from "./squad.js";
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    resetOtp:{
        type:String,
        default:null,
    },
    squads:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Squad"
        
    }]
},{timestamps:true})



const User = mongoose.model("User",UserSchema)

export default User