import mongoose from "mongoose";

const tripsSchema = new mongoose.Schema({
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
                return Array.isArray(v) && v.length > 0;
            },
            message:'Student IDs are invalid.'
        }
    },
    startTime:{
        type:Date,
        required:true,
        default:Date.now,
    },
    endTime:{
        type:Date,
    },
    tripStatus:{
        type:String,
        enum:['YET TO START','STARTED', 'ONGOING', 'COMPLETED'],
        default:'YET TO START',
        required:true
    },
    duration:{
        type:Number,
        required:true,
        default:0
    },
}, {timestamps:true});

tripsSchema.pre("save", function(next){
    if(this.tripStatus === "COMPLETED"){
        this.endTime = new Date();
        this.duration = this.endTime.getTime() - this.startTime.getTime();
    }
    next();
});

export const Trips = await mongoose.model("Trips", tripsSchema);