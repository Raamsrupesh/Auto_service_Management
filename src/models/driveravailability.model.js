import mongoose from "mongoose";

const driverAvailabilitySchema = new mongoose.Schema({
    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
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
        enum:['AVAILABLE', 'BUSY', 'OFFLINE'],
        required:true,
    },    
    currentLocation:{
        type:String,
        required:true
    },
    vehicleID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vehicles",
        required:true,
        unique:true
    },
    markedAt:{
        type:Number,
        required:true
    }
},{timestamps:true});

export const driverAvailability = mongoose.model("driverAvailability", driverAvailabilitySchema);