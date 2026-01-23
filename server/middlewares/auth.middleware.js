import dotenv from 'dotenv'
dotenv.config()

import jwt from 'jsonwebtoken'

export const isAuth = async(req,res,next)=>{

    try {
        const {token} = req.cookies;
        
        if(!token){
            return res.status(401).json({message:"failed ot authenticate user ",success:false})
        }
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message:"failed to destructure token",success:false})
        }
        // req.id = decoded.userId;
        req.body.userId = decoded.userId

        next();
    } catch (error) {
        return res.status(401).json({message:"failed to authenticate user through middleware",success:false})
    }
}


export default isAuth;