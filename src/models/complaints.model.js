import mongoose from "mongoose";

const complaintsSchema = new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    on:{
        type:String,
        enum:['DRIVER', 'VEHICLE', 'TRIP', 'ANYELSE'],
        required:true
    },
    OnId:{
        type:String,
        required:true
    },
    complaint:{
        type:String,
        requiured:true
    }
})

export const Complaints = await mongoose.model("Complaints", complaintsSchema);