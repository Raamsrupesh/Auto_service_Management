import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    studentID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true,
        unique:true
    },
    planType:{
        type:String,
        enum:['CASUAL', "DISCOUNTED"],
        default:'CASUAL',
        required:true,
        trim:true
    },
    startDate:{
        type:Date,
        default:Date.now,
        required:true
    },
    endDate:{
        type:Date,
        default:Date.now + (30 * 24 * 60 * 60 * 1000),
        required:true
    },
    amount:{
        type:Number,
        required:true,
        trim:true,
    },
    paymentStatus:{
        type:Boolean,
        required:true,
    },    
    subscriptionStatus:{
        type:Boolean,
        required:true
    },
},{timestamps:true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);