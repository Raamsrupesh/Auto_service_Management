import mongoose from "mongoose";

const userAllocationsSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum:['DRIVER', 'STUDENT'],
        default:"STUDENT",
        required:true
    },
    status:{
        type:String,
        enum:['CANCELLED', 'COMPLETED', 'ONGOING'],
        default:"ONGOING",
        required:true,
    },    
    allocationDate:{
        type:Date,
        default:Date.now,
        required:true
    }
},{timestamps:true});

export const userAllocationsStatus = mongoose.model("userAllocationsStatus", userAllocationsSchema);