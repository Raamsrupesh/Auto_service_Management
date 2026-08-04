import mongoose from "mongoose";

const collegeLocationSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    latitude:{
        type:Number,
        required:true,
    },    
    longitude:{
        type:Number,
        required:true
    },
    landMark1:{
        type:String,
        required:true,
    },
    landMark2:{
        type:String,
        required:true
    },
    landMark3:{
        type:String,
    }
},{timestamps:true});

export const collegeLocation = mongoose.model("collegeLocation", collegeLocationSchema);