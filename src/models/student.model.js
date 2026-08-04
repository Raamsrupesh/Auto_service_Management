import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    rollNo:{
        type:String,
        required:true,
        trim:true
    },
    collegeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "collegeLocation",
        required:true,
        unique:true
    },
    year:{
        type:Number,
        required:true,
        trim:true,
    },
    subscriptionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subscription",
        required:true,
        trim:true,
    },
    currentAvailability:{
        type:Boolean,
        required:true,
    },
    
    pickupLocation:{
        type:String,
        required:true
    },
    emergencyContact:{
        type:String,
        required:true
    },
    preferences:{
        type:Array,
    }
},{timestamps:true});

export const Student = mongoose.model("Student", studentSchema);