import mongoose from "mongoose";

const allocationsSchema = new mongoose.Schema({
    tripId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Trips",
        required:true,
        unique:true
    },
    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
        required:true,
        unique:true
    },
    vehicleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vehicle",
        required:true,
        unique:true
    },
    studentIds:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Student",
        required:true,
        validate:{
            validator : function(v){
                return Array.isArray(v) && v.length > 0
            },
            message:'Student IDs are invalid.'
        }
    },
    allocationTime:{
        type:Date,
        required:true,
        default:Date.now,
    },
    allocationStatus:{
        type:String,
        enum:['LOCKED', 'OPEN'],
    },
    algorithmVersion:{
        type:Number,
    },


}, {timestamps:true});

export const Allocations = await mongoose.model("Allocations", allocationsSchema);