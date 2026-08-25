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
        default:"AVAILABLE"
    },    
    vehicleID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vehicles",
        required:true,
        unique:true
    },
    
        longitude:{
            type:Number,
            required:true
        },
        latitude:{
            type:Number,
            required:true
        },
    
    destinations:{
        type:Array,
        required:true
    }
},{timestamps:true});

export const driverAvailability = mongoose.model("driverAvailability", driverAvailabilitySchema);