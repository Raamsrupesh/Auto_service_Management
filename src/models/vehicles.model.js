import mongoose from "mongoose";

const vehiclesSchema = new mongoose.Schema({
    driverID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
        required:true,
    },
    vehicleNumber:{
        unique:true,
        type:String,
        required:true,
        trim:true
    },
    vehicleType:{
        type:String,
        enum:['AUTO', 'MAXICAB'],
        default:'AUTO',
        required:true
    },
    seatCapacity:{
        type:Number,
        required:true,
        trim:true,
    },
    availableSeats:{
        type:Number,
        required:true,
        trim:true,
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    }, 
    uploadedImage:{
        type:String,
        required:true
    }   
    // currentLocation:{
    //     type:String,
    //     required:true
    // },
},{timestamps:true});

export const Vehicles = mongoose.model("Vehicles", vehiclesSchema);