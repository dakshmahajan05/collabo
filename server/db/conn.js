import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Collabo's Database ~");
        
    } catch (error) {
        console.log("err while connecting to db", error.message);
        
    }
}

export default connectDB;