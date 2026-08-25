import {Vehicles} from '../models/vehicles.model.js'
import {Driver} from '../models/driver.model.js'
import { Trips } from '../models/trips.model.js';
import { Student } from '../models/student.model.js';
import { driverAvailability } from '../models/driveravailability.model.js';
import {Allocations} from '../models/allocations.model.js';
import { studentAvailability } from '../models/studentavailability.model.js';

export async function getAuto(req, res, next) {
    try {
        const vehicleID = req.vehicleID;
        const vehicle = await Vehicles.findById(vehicleID);

        return res.status(200).json({data: vehicle});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'getAuto';
        return next(error);
    }
}

export async function giveCompleteDriverDetails(req, res, next) {
    try {
        const {id} = req.params;
        const {licenseNumber, vehicleId, currentLocation, collegeIDs} = req.body;
        // Validate(field, type(email, phno, text, number))
        const driver = await Driver.findByIdAndUpdate(id, {licenseNumber, vehicleId, currentLocation, collegeIDs});
        return res.status(201).json({msg : "Details Inserted Succesfully!!"})

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'giveCompleteDriverDetails';
        return next(error);
    }
}

export async function get_driver_trips_details(req, res, next) {
    try {
        const id = req.id;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const driver_trips = await Trips.find({driverId:id}).skip(((page-1) * limit)).sort({endTime:-1}).limit(limit);
        return res.status(200).json({data:driver_trips});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'get_driver_trips_details';
        return next(error);
    }
}

export async function get_driver_trip_details(req, res, next) {
    try {
        const id = req.id;
        const {tripId} = req.params;
        
        
        const trip_det = await Trips.findOne({driverId:id, _id:tripId})
        if (!trip_det) {
            return res.status(404).json({
                msg: "Trip not found",
            });
        }
        
        const allStudentDet = [];
        trip_det.forEach(async (student_id) => {
            const student = await Student.findById(student_id);
            if(student.size()!=0){ // Finding the size of student document.
                allStudentDet.push(student);
            }
        });

        return res.status(200).json({data : [trip_det, allStudentDet]})
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'get_driver_trip_details';
        return next(error);
    }
}

export async function driverMarkingArrived(req, res, next) {
    try {
        const id = req.id;
        const vehicleID = req.vehicleID;
        const {long, lat, destinations} = req.body; //Assuming that we're getting the details from req.body .
        await driverAvailability.insertOne({driverId:id, vehicleID, longitude:long, latitude:lat, destinations});
        return res.status(201).json({msg : "Succesfully inserted!!"});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'driverMarkingArrived';
        return next(error);
    }
}

export async function driverLiveTrip(req, res, next) {
    try {
        const id = req.id;
        const vehicleID = req.vehicleID;

        const allocation = await Allocations.findOne({driverId:id, allocationTime:{$gt: Date.now()-12*60*60*1000}, allocationStatus:"OPEN"});
        // return res.status(200)
        const allStudentInfo = [];
        await allocation.forEach(async (student_id) => {
                const student_info = await Student.findById(student_id);
                allStudentInfo.push(student_info);
        });
        return res.status(200).json({data:allStudentInfo});


    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'driverLiveTrip';
        return next(error);
    }
}

export async function giveCompleteVehicleDetails(req, res, next) {
    try {
        const id = req.id;

        if(!req.file) return res.status(200).json({msg : "No file exists.."});

        const {vehicleNumber, vehicleType, seatCapacity, availableSeats} = req.body;
        vehicleType = vehicleType || "AUTO";
        const vehicle = await Vehicles.insertOne({
            driverID:id,
            vehicleNumber,
            vehicleType,
            seatCapacity,
            availableSeats,
            uploadedImage: req.file.path
        });

        return res.status(201).json({msg : "Succesfully inserted!!"})

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'driverLiveTrip';
        return next(error);
    }
}

export async function startTripForDriver(req, res, next) {
    try {
        const id = req.id;
        const vehicleID = req.vehicleID;
        const date_limit = Date.now() - 12*60*60*1000;
        await driverAvailability.findOneAndUpdate({driverId:id, vehicleID, status: "AVAILABLE", date:{$gt:Date.now()-12*60*60*1000}}, {status:"BUSY"});
        await Allocations.findOneAndUpdate({driverId: id, allocationStatus:"OPEN"}, {allocationStatus:"LOCKED"});
        await Trips.insertOne({driverId:id, vehicleId:vehicleID, studentIds:doc.studentIds, tripStatus:"YET TO START", })
        
        return res.status(200).json({msg : "Succesfully started the trip!!"});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'startTripForDriver';
        return next(error);
    }
}

export async function endTripForDriver(req, res, next) {
    try {
        const id = req.id;
        const vehicleID = req.vehicleID;

        // const date_limit = Date.now() - 12*60*60*1000;
        // await driverAvailability.findOneAndUpdate({driverId:id, vehicleID, status: "BUSY", date:{$gt:Date.now()-12*60*60*1000}}, {status:"OFFLINE"});
        
        // await Allocations.findOneAndUpdate({driverId: id, allocationStatus:"OPEN"}, {allocationStatus:"LOCKED"});
        await Trips.findOneAndUpdate({driverId:id, vehicleId:vehicleID,  }, {tripStatus:"COMPLETED"})
        
        return res.status(200).json({msg : "Succesfully started the trip!!"});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'startTripForDriver';
        return next(error);
    }
}
