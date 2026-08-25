import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    licenseNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    vehicleId:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    status:{
        type:String,
        required:true,
        enum:['ONLINE', 'OFFLINE'],
        default:'OFFLINE',
        trim:true,
    },
    subscriptionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subscription",
        required:true,
        trim:true,
    },
    currentLocation:{
        type:String,
        required:true
    },
    totalTrips:{
        type:Number,
        required:true
    },
    totalRevenue:{
        type:Number,
        required:true,
    },
    rating:{
        type:Number,
        required:true
    },
    individualRating:{
        type:Array,
        required:true
    },
    collegeIDs:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:"collegeLocation",
    }
},{timestamps:true});

export const Driver = mongoose.model("Driver", driverSchema);