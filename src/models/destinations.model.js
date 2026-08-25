import mongoose from "mongoose";

const destinationsSchema = new mongoose.Schema({
    studentID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        require:true,
        unique:true
    },
    destination1:{
        type:String,
        required:true
    },
    destination2:{
        type:String
    },
    destination3:{
        type:String
    }
}, {timestamps:true});

export const Destinations = await mongoose.model("Destinations", destinationsSchema);