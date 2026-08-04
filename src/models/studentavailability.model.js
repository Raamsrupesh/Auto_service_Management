import mongoose from "mongoose";

const studentAvailabilitySchema = new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true,
        unique:true
    },
    date:{
        type:Date,
        default:Date.now,
        required:true
    },
    status:{
        type:String,
        enum:['AVAILABLE', 'NOT AVAILABLE'],
        required:true,
    },    
    location:{
        type:String,
        required:true
    },
    markedAt:{
        type:Number,
        required:true
    }
},{timestamps:true});

export const studentAvailability = mongoose.model("studentAvailability", studentAvailabilitySchema);