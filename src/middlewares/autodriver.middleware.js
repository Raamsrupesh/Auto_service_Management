import jwt from 'jsonwebtoken';
import {Driver} from '../models/driver.model.js'
import { Vehicles } from '../models/vehicles.model.js';


export default async function isAutoDriver(req, res, next){
    try {
        const {Authorization} = req.headers;

        if(!Authorization) return res.status(400).json({msg : "Headers Missing!!"});

        if(!Authorization.startsWith('Bearer')) return res.status(400).json({msg : "Incorrect Headers found!!"});

        const token = Authorization.split(" ")[1];
        if(!token) return res.status(400).json({msg : "No Token Found!!"});
        
        const payload = await jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        if(!payload) return res.status(400).json({msg : "No Valid Token exists!!"});
        if(!payload.role){
            return res.status(400).json({msg : "No Valid role exists!!"});
        }
        if(payload.role !== "AutoDriver"){
            return res.status(400).json({msg : "Invalid role exists!!"});
        }
        const act_dri = await Driver.findOne({userId: payload.id});
        const vehicle_det = await Vehicles.findOne({driverID: act_dri._id});
        
        req.id = act_dri._id;
        req.role = payload.role;
        req.vehicleID = vehicle_det._id;

        next();
    } catch (error) {
        return res.status(500).json({msg : "Something Went Wrong!!"});
    }
}