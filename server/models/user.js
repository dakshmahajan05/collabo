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
        type:Number,
        default:null,
    },
    loginOtp:{
        type:Number,
        default:null
    },
    registerOtp:{
        type:Number,
        default:null
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otpExpiresAt:{
        type:Number,
        default:0
    },
    squads:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Squad"
        
    }]
},{timestamps:true})



const User = mongoose.model("User",UserSchema)

export default User