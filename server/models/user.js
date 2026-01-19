import mongoose from "mongoose";
import Squad from "./squad.js";
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    resetOtp:{
        type:String,
        default:null,
    },
    loginOtp:{
        type:String,
        default:null
    },
    registerOtp:{
        type:String,
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
        
    }],
    profilePic:{
        type:String,
        default:'',
    },
    socialLinks:{
        github:{
            type:String,
            default:''
        },
        linkedIn:{
            type:String,
            default:''
        }
    },
    skills:{
        type:[String],
        default:[]
    },
    bio:{
        type:String,
        default:''
    }
},{timestamps:true})

UserSchema.index({ email: 1 });
UserSchema.index({ skills: 1 });

const User = mongoose.model("User",UserSchema)

export default User