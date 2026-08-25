import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import Redis from 'redis';
import {sendEmailFnx} from '../services/emai.service.js'
import {User} from '../models/user.model.js'
import {Student} from '../models/student.model.js'
import {Driver} from '../models/driver.model.js'

const redis = new Redis();

export async function register(req, res, next){
    try {
        const {name, email, password} = req.body;

        const user_exists = await User.findOne({email});
        if(user_exists) return res.status(400).json({msg: "⚠️ User aldready exists!", success:false});

        const encryptedPswd = await argon2.hash(password);
        const newRecord = await User.insertOne({name, email, password:encryptedPswd});
    

            const otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            await redis.set(email, otp);

            await redis.expire(email, 120);

            await sendEmailFnx(email, otp);


        return res.status(201).json({success:true, msg : "✅ Sent OTP Successfully!", success:true});
        
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'register';
        return next(error);
   }

}

export async function login(req, res, next){
    try {
        const {email, password} = req.body;

        const exists = await User.findOne({email});
        if(exists){
            if(await argon2.verify(exists.password, password)){
                const accesstoken = await jwt.sign({id: exists._id, role }, process.env.JWT_ACCESS_SECRET, {expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
                const refreshtoken = await jwt.sign({id: exists._id, role }, process.env.JWT_ACCESS_SECRET, {expiresIn:process.env.REFRESH_TOKEN_EXPIRY});
                res.cookie("refreshToken", refreshtoken, {
                    httpOnly:true,
                    secure:true,
                    samesite:"strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                exists.refreshtoken = refreshtoken;
                await exists.save();
                return res.status(200).json({msg : "LogIN Successfull!", token:accesstoken});
            }
            return res.status(400).json({msg : "Incorrect Password!!"});
        }

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'login';
        return next(error);
    }
}

export async function forgotPassword(req, res, next) {
    try {
        
        const {email} = req.body;
        const exists = await User.findOne({email});

        if(exists){
            const otp = Math.floor(Math.random()*100000);
            await redis.set(email, otp);
            await sendEmailFnx(email, otp);
            return res.status(200).json({msg :`Successfully Sent OTP to email: ${email}`});
        }
        return res.status(400).json({msg :`No such email exists!!`});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'forgotPassword';
        return next(error);
    }
}

export async function forgotPasswordOTPCheck(req, res, next) {
    try {
        const {email, act_otp} = req.body;

        const otp = await redis.get(email);
        if(act_otp === otp) return res.status(200).json({msg : "Successfully done it!!"});
        return res.status(400).json({msg : "OTP is incorrect!!"});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'forgotPasswordOTPCheck';
        return next(error);
    }
}

export async function refreshToken(req, res, next) {
    try {
        const refresh_token = req.cookie.refreshToken;
        if(!refresh_token) return res.status(400).json({msg : "No refresh token exists!!"});
        
        const if_exists = await User.findOne({refreshtoken:refresh_token});
        if(!if_exists) return res.status(400).json({msg : "Refresh token is incorrect!!"});
        
        const payload = await jwt.verify(refresh_token);
        if(!payload) return res.status(400).json({msg : "No payload exists!!"});
        
        const accessToken = await jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'});
        return res.status(200).json({msg : "Access token generated!!", token:accessToken});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'refreshToken';
        return next(error);
    }
}

export async function resetPasswordOTPCheck(req, res, next) {
    try {
        const {email, act_otp, new_password} = req.body;
        if(!email || !otp) return res.status(400).json({msg : "Every field must be filled!!"});
        
        const act_user = await User.findOne({email});
        const otp = await redis.get(email);
        if(act_otp === otp) {
            act_user.password = await argon2.hash(new_password);
            act_user.save();
            return res.status(200).json({msg : "Successfully done it!!"});
        }
        return res.status(400).json({msg : "OTP is incorrect!!"});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'resetPasswordOTPCheck';
        return next(error);
    }
}

export async function verifyEmail(req, res, next) {
    try {
        const {email, act_otp} = req.body;
        const otp = await redis.get(email);
        const act_user = await User.findOne({email});

        if(act_otp.toString() === otp.toString()){
            act_user.isEmailVerified = true;
            act_user.save();
            return res.status(200).json({msg : "OTP Verified"});
        }
        return res.status(400).json({msg : "OTP is incorrect!!"});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'verifyEmail';
        return next(error);
    }
}

export async function uploadImage(req, res, next) {
    try {
        if(!req.file) return res.status(500).json({msg : "No file uploaded!!"});

        return res.status(200).json({msg:"Image uploded successfully!!", imageURL:req.file.path});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Image upload error';
        error.function_name = 'uploadImage';
        return next(error);
    }
}

export async function getMe(req, res, next){
    try {
        const id = req.id;
        const act_user = await User.findById(id);
        
        if(!act_user) return res.status(400).json({msg:"No user exists!"});
        
        if(act_user.role === "Student"){
            const student = await Student.findOne({userId:id});
            return res.status(200).json({msg : {user:act_user, student}});
        }
        else if(act_user.role === "AutoDriver"){
            const driver = await Driver.findOne({userId:id});
            return res.status(200).json({msg : {user:act_user, driver}});
        }
        else if(act_user.role !== "ADMIN"){
            return res.status(200).json({msg : {user:act_user}});
        }
        
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'getMe';
        return next(error);
    }
}

export async function changePassword(req, res, next) {
    try {
        const {email, old_password, new_password} = req.body;
        const id = req.id;

        const act_user = await User.findById(id);

        if(!act_user) return res.status(400).json({msg : "NO User exists!"});

        if(act_user.email !== email) return res.status(400).json({msg : "Incorrect Email!!"});
        const isCrtpswd = await argon2.verify(act_user.password, old_password);

        if(isCrtpswd){
            const encryptedPswd = await argon2.hash(new_password);
            act_user.password=encryptedPswd;
            act_user.save();
            return res.status(200).json({msg : "Successfully Updated the password!!"});
        }

        return res.status(400).json({msg : "Password is incorrect!"});
        
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'changePassword';
        return next(error);
    }
}

export async function logOut(req, res, next) {
    try {
        const {refreshToken} = req.body;
        const id = req.id;
        const act_user = await User.findById(id);
        
        if(!act_user) return res.status(400).json({msg : "No User Exists!!"});
        
        act_user.refreshtoken = null;
        act_user.save();
        
        return res.status(200).json({msg : "Successfully Logged OUT!"});
        
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'logOut';
        return next(error);
    }
}