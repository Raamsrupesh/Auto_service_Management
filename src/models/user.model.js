import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    role:{
        type:String,
        enum:['Student', 'AutoDriver', 'ADMIN'],
        required:true,
        default:'Student'
    },
    isEmailVerified:{
        type:Boolean,
        required:true,
    },
    lastLogin:{
        type:Date,
        required:true,
        default:Date.now,
    },
    refreshToken:{
        type:String,
        required:true
    }
},{timestamps:true});

export const User = await mongoose.model("User", userSchema);