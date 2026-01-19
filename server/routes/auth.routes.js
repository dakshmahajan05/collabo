import express from 'express'
import { Router } from 'express'
import { getUserData, isAuthenticated, login, logout, register, resendOtp, resetPass, resetPassOtp, verifyLoginOtp, verifyRegisterOtp } from '../controllers/Auth.controllers.js';
import isAuth from '../middlewares/auth.middleware.js';

const authrouter = Router()

authrouter.post('/register',register)
authrouter.post('/verifyRegisterOtp',verifyRegisterOtp)
authrouter.post('/login',login)
authrouter.post('/verifyLoginOtp' ,verifyLoginOtp)

authrouter.post('/resetPassOtp',resetPassOtp)
authrouter.post('/resetPass',resetPass)
authrouter.post('/resendOtp',resendOtp)

authrouter.post('/logout',isAuth,logout)

authrouter.get('/isAuthenticated',isAuth,isAuthenticated)
authrouter.get('/getUserData',isAuth,getUserData)

export default authrouter;