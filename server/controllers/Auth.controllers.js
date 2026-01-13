import transporter from "../config/nodemailer.js";
import User from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



export const register = async(req,res)=>{
    try {
        const {email,password,name} = req.body;

        if(!email || !name || !password){
            return res.status(400).json({message:"enter all detaiils",success:false})
        }

        const existingUser =await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"user already exists",success:false})
        }

        const hashpass = await bcrypt.hash(password,10)

        const otp = String(Math.floor(Math.random()*900000 + 100000));
        
        const mailOptions = {
            from:process.env.SENDER_MAIL,
            to:email,
            subject:"SignUp verification OTP",
            text:`heyy user! this otp has been sent to you for verifying your email for Collabo
            please verify with the OTP:${otp}`
        }
        
        
        await transporter.sendMail(mailOptions)
        
        
        
        const user = new User({email,name,password:hashpass});
        user.registerOtp=otp;
        user.otpExpiresAt=Date.now() + 5*60*1000;
        await user.save();

        console.log("mail sent for registering user");
        

        return res.status(200).json({message:"user registered sucessfully",success:true})
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"err while registering user",success:false})
        
    }
}

export const verifyRegisterOtp = async(req,res)=>{
    try {
        const {otp,email} = req.body;

        if(!otp || !email){
            return res.status(400).json({message:"please enter the otp",success:false})
        }
        const user = await User.findOne({email})

        if(!user){
             return res.status(400).json({message:"user doesn't exist",success:false})

        }

        if(user.otpExpiresAt<Date.now()){
            return res.status(400).json({message:"otp expired",success:false})
        }

        if(otp !=user.registerOtp){
            return res.status(400).json({message:"otp doesnt match",success:false})
        }

        user.isVerified=true;
        user.registerOtp=null;
        user.otpExpiresAt=0;
        await user.save();


        return res.status(200).json({message:"user verified success",success:true});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({message:"err while verifying user registeration otp",success:false,error})
        
    }
}

export const login = async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({message:"missing credentials",success:false});
        }


        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"no such user found",success:false});
        }
        
        
        
        const verifyPass = await bcrypt.compare(password,user.password);
        if(!verifyPass){
            return res.status(400).json({message:"incorrect passowrd",success:false});
        }
        
        if(!user.isVerified){
            return res.status(400).json({message:"user is not verified",success:false});
        }
        
        const otp = String(Math.floor(Math.random()*900000 + 100000));
        
        const mailOptions={
            from :process.env.SENDER_MAIL,
            to:email,
            subject:'login verification OTP for Collabo',
            text:`heyy user! this otp has been sent to you for verifying your login on Collabo
            please verify with the OTP:${otp}`
        }
        
        
        await transporter.sendMail(mailOptions);
        user.otpExpiresAt=Date.now() + 5*60*1000;
        user.loginOtp=otp;
        await user.save();

        return res.status(200).json({message:"otp sent for loggin in",success:true})
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"err in login",success:false,error})
    }
}


export const verifyLoginOtp = async(req,res)=>{
    try {
        const {otp,email} = req.body;

        if(!otp || !email){
        return res.status(400).json({message:"missing credentials",success:false});
        }

        const user = await User.findOne({email});
        if(!user){
        return res.status(400).json({message:"no such user exists",success:false})
            
        }

        if(user.otpExpiresAt<Date.now()){
            return res.status(400).json({message:"otp expired",success:false});
        }

        if(user.loginOtp!=otp){
            return res.status(400).json({message:"login otp doesn't match",success:false});
        }
        user.loginOtp=null;
        user.otpExpiresAt=0;
        await user.save()

        const token = jwt.sign({email,userId:user._id},process.env.JWT_SECRET,{expiresIn:'1d'})
        res.cookie("token",token,{
             httpOnly:true,
             secure:true,
             maxAge:24*60*60*1000
        })
        

        return res.status(200).json({message:"user login successfull",id:user._id,name:user.name,email:user.email,success:true})
    } catch (error) {
        return res.status(400).json({message:"failed to login verification otp",success:false})
        
    }
}

export const resetPassOtp = async(req,res)=>{
    try {
       const {email} = req.body;
       const user = await User.findOne({email});
       if(!user){
        return res.status(400).json({message:"no such user exists",success:false});
       }
       if(!user.isVerified){
        return res.status(400).json({message:"this email does not belongs to a verified user",success:false});
       }
       const otp = String(Math.floor(Math.random()*900000 + 100000));

       const mailOptions={
        from:process.env.SENDER_MAIL,
        to:email,
        subject:"passowrd reset request",
         text:`heyy user! your account has received a password reset request for Collabo, please verify it woith the OTP:${otp}`
       }
       await transporter.sendMail(mailOptions)

       user.resetOtp=otp;
       user.otpExpiresAt=Date.now() + 5*60*1000
       await user.save();

       return res.status(200).json({message:"otp send to verify pass reset request",success:true})

    } catch (error) {
       return res.status(400).json({message:"faileds to send otp to verify pass reset ",success:false,error})
    }
}

export const resetPass= async(req,res)=>{
    try {
        const {otp,password,email} = req.body;

        if(!otp || !password){
            return res.status(400).json({message:"missing credentials"})
        }

        const user = await User.findOne({email});
        if(!user){
            return res.json({message:"no user exists",success:false});
        }

        if(user.otpExpiresAt<Date.now()){
            return res.status(400).json({message:"otp expired",success:false});
        }
        if(otp!==user.resetOtp){
            return res.status(400).json({message:"otp mismatched ",success:false})
        }

        const hashpass = await bcrypt.hash(password,10);


        user.password=hashpass,
        user.resetOtp=null;
        user.otpExpiresAt=0;
        await user.save();

        return res.status(200).json({message:"password updated successfully"})
    } catch (error) {
        return res.status(400).json({message:"failed to reste pass",success:false,error})
    }
}


export const logout = async(req,res)=>{
   try {
        res.clearCookie("token",{
        httpOnly:true,
        secure:true,
        sameSite:'strict',
    })
    return res.status(200).json({message:"user logout successfull",success:true});

   } catch (error) {
        return res.status(500).json({message:"failed tpo logout user",success:false})
   }
}


export const resendOtp = async(req,res)=>{
    try {
        const {email,type}= req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"no such user exists"});
        }
        const otp = String(Math.floor(Math.random()*900000 + 100000));

        if(type == 'register') user.registerOtp=otp
        else if (type=='login') user.loginOtp=otp
        else if(type=='reset') user.resetOtp=otp

        user.otpExpiresAt=Date.now() + 5*60*1000
        await user.save();

        const mailOptions={
            from:process.env.SENDER_MAIL,
            to:email,
            subject:`Resend OTP for ${type}`,
            text:`your new OTP for ${type}ing is ${otp}`
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({message:"otp sent again",success:true})

    } catch (error) {
        return res.status(400).json({message:"failed to send otp again",successa:false,error})
        
    }
}

export const isAuthenticated = async(req,res)=>{
    try {
        const {userId} = req.body;
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user is not Authenticated",success:false})
        }
        return res.status(200).json({message:"user Authenticated",success:true})
    } catch (error) {
        return res.status(400).json({message:"failed to autheticate",success:false})
    }
}


export const getUserData = async(req,res)=>{
    try {
        const {userId} = req.body;
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(400).json({message:"no such user exists",success:false});
        }

        return res.status(200).json({message:"user data fetched successfully",success:true,email:user.email,name:user.name})
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"failed to get user data",success:false,error})
    }
}

