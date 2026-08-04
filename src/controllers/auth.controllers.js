import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import Redis from 'redis';
import {sendEmailFnx} from '../services/emai.service.js'
import {User} from '../models/user.model.js'
import {Student} from '../models/student.model.js'
import {Driver} from '../models/driver.model.js'

const redis = new Redis();

export async function register(req, res){
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
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            success: false,
        });
        process.exit(1);
   }

}

export async function login(req, res){
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
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            success: false,
        });
        process.exit(1);
    }
}

export async function forgotPassword(req, res) {
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
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'forgotPassword',
            success: false,
        });
        process.exit(1);
    }
}

export async function forgotPasswordOTPCheck(req, res) {
    try {
        const {email, act_otp} = req.body;

        const otp = await redis.get(email);
        if(act_otp === otp) return res.status(200).json({msg : "Successfully done it!!"});
        return res.status(400).json({msg : "OTP is incorrect!!"});
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'forgotPasswordOTPCheck',
            success: false,
        });
        process.exit(1);
    }
}

export async function refreshToken(req, res) {
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
        // next(error);
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'refreshToken',
            success: false,
        });
        process.exit(1);
    }
}

export async function resetPasswordOTPCheck(req, res) {
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
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'resetPasswordOTPCheck',
            success: false,
        });
        process.exit(1);
    }
}

export async function verifyEmail(req, res) {
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
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'verifyEmail',
            success: false,
        });
        process.exit(1);
    }
}
