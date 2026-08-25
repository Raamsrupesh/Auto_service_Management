import {User} from '../models/user.model.js';
import {Student} from '../models/student.model.js';
import {collegeLocation} from '../models/locations.model.js';
import {Subscription} from '../models/subscriptions.model.js'
import {studentAvailability} from '../models/studentavailability.model.js'
import {driverAvailability} from '../models/driveravailability.model.js'
import {Destinations} from '../models/destinations.model.js'
import {Allocations} from '../models/allocations.model.js'
import {Vehicles} from '../models/vehicles.model.js'
import {userAllocationsStatus} from '../models/userAllocationStatus.model.js'
import {Trips} from '../models/trips.model.js'
import {Driver} from '../models/driver.model.js'
import {Complaints} from '../models/complaints.model.js'

import {give_list_for_complaint, complaint_on_a_specificthing} from '../utils/saggregate_complaint.js';
import {avg} from '../utils/find_avg.js';

export async function giveCompleteStudentDetails(req, res, next) {
    try {
        const id = req.id;
        const {rollNo, collegeId, year, pickupLocation, emergencyContact, preferences} = req.body;
        //validate(field, type(email, phno, text, number));
        const student = await Student.findByIdAndUpdate(id, {rollNo, collegeId, year, pickupLocation, emergencyContact, preferences});
        return res.status(201).json({msg : "Successfully created the new User!!"});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'giveCompleteStudentDetails';
        return next(error);
    }
}

export async function studentBookingAuto(req, res, next){
    try {
        const {id} = req;
        const {lat, long} = req.body;
        const student = await Student.findById(id);
        const college_det = await collegeLocation.findById(student.collegeId);

        if((lat >= college_det.latitude - 0.05 && lat <= college_det.latitude + 0.05) && (long >= college_det.longitude - 0.05 && long <= college_det.longitude + 0.05)){
            /**
             * Subscription Management -> Is he a subscribed Student???
             */
            const sub = await Subscription.find({studentID:id});
            if(sub.endDate < Date.now()){
                /**
                 * Check Whether he has aldready applied
                 */

                const applied = await studentAvailability.findOne(
                    {studentId:id, markedAt: {$gt : Date.now() - 24*60*60*1000}}
                );
                if(!applied){
                    const stu_dest = await Destinations.findOne({studentID: id});
                    if(stu_dest){
                        /**
                         * Inserting record in studentAvailability of student
                         */
                        const rec = await studentAvailability.insertOne({studentId:id, latitude:lat, longitude:long});
                        /**
                         * Checking driversAvailability and destinations
                         */
                        const driversAva = await driverAvailability.find(
                            {status:"AVAILABLE", $or:[
                                {destinations: stu_dest.destination1},
                                {destinations: stu_dest.destination2},
                                {destinations: stu_dest.destination3},
                            ]}
                        )
                        /**
                         * Give the auto's where the students are not fully filled.
                         */
                        const vehicle_det = await Vehicles.find(
                            {driverID: driversAva.driverId}
                        )
                        const curr_allocations = await Allocations.find(
                            {driverId:driversAva.driverId},
                            {allocationStatus: "OPEN"}
                        ).sort({})
                        
                        /**
                         * I am stopping this for now because The next and some of the above processes Should be due with 'aggregation pipeline' framework
                         */

                        // SOCKETIO implementation -> MAP mein 2 dikhana hai


                    }
                }
            }
        }
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'studentBookingAuto';
        return next(error);
    }
}

export async function student_bookings(req, res, next){
    try {
        const {page, limit} = req.query;
        const sid = req.id;

        const user_det = await Student.findById(sid);
        const student = await userAllocationsStatus.find(
            {user_id: user_det.userId}
        ).limit(limit).sort({allocationDate: -1}).skip(((page - 1)*limit))

        return res.status(200).json({data:student, success:true});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'student_bookings';
        return next(error);
    }
}

export async function student_specific_booking(req, res, next){
    try {
        const id = req.id;
        const {booking_id} = req.params;

        const stu_alloc = await userAllocationsStatus.findById(booking_id);
        if(stu_alloc.status === "COMPLETED" || stu_alloc.status === "ONGOING"){
            const created = new Date(stu_alloc.createdAt);

            const start = new Date(created);
            start.setHours(0, 0, 0, 0);

            const end = new Date(created);
            end.setHours(23, 59, 59, 999);

            const trips = await Trips.findOne({
            createdAt: { $gte: start, $lte: end },
            studentIds: { $in: [id] }
            });

            return res.status(200).json({trips, stu_alloc});
        }

        return res.status(200).json({stu_alloc});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'student_specific_booking';
        return next(error);
    }
}

export async function delete_student_booking(req, res, next){
    try {
        const id = req.id;
        const {booking_id} = req.params;

        const trip = await Trips.findOne({
                studentIds: {$in:[id]},
                createdAt: {$and:[
                    {$gt : Date.now() - 24*60*60*1000},
                    {$lt: Date.now()}
                ]}
            }
        );
        if(trip) return res.status(404).json({msg : `Trip aldready started at: ${trip.createdAt}`});
        const created = new Date(Date.now());
        
        const start = new Date(created);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(created);
        end.setHours(23, 59, 59, 999);
        
        const allocs = await Allocations.updateOne(
            {createdAt: {$gte:start, $lte:end}, allocationStatus: "OPEN", studentIds: id},
            {studentIds: {$remove : id}}
        )
        if(!allocs) return res.status(404).json({msg : `Student didnt started booking auto!!`});

        const user = await Student.findById(id);
        await userAllocationsStatus.updateOne(
            {userId: user.userId, status:"ONGOING"},
            {status:"CANCELLED"}
        )

        res.status(200).json({msg: "Cancelled the ride Successfully!!"});

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'delete_student_booking';
        return next(error);
    }
}


export async function get_student_trips_details (req, res, next){
  try {
    const {id} = req; 

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const allTrips = await Trips.find({
      studentIDs: { $in: [id] },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    return res.status(200).json({
      tripDetails: allTrips,
    });
  } catch (error) {
    error.status_code = 500;
    error.msg = 'Internal server error';
    error.function_name = 'get_student_trips_details';
    return next(error);
  }
}

export async function get_student_trip_details (req, res, next) {
  try {
    const studentId = req.id; 
    const {tripId} = req.params;

    const trip = await Trips.findOne({_id:tripId, studentIds: studentId});
    if (!trip) {
        return res.status(404).json({
            msg: "Trip not found",
        });
    }
    const driver = await Driver.findById(trip.driverId);
    if (!driver) {
        return res.status(404).json({
            msg: "Driver not found",
        });
    }
    const allStudentDet = [];
    trip.studentIDs.forEach(async (studentid) => {
        const studentDet = await Student.findById(studentid);
        allStudentDet.push(studentDet);
    });

    /**
     * trip.studentIDs
     */


    return res.status(200).json({
      driverDetails: driver,
      allStudentDet,
      tripDetails: trip,
    });
  } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'get_student_trip_details';
        return next(error);
    }
};


export async function drivers_list(req, res, next){
    try {
        const {id} = req;
        const drivers = give_list_for_complaint('DRIVER', id);
        res.status(200).json({drivers});
    } catch (error) {  
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'drivers_list';
        return next(error);
    }
}

export async function complaint_on_a_driver(req, res, next){
    try {
        const {id} = req;
        const {driver_id} = req.params;
        const {complaint} = req.body;
        complaint_on_a_specificthing(id, "DRIVER", driver_id, complaint);
        return res.status(201).json({msg : "Successfully raised a request on a driver."});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'complaint_on_a_driver';
        return next(error);
    }
}

export async function vehicles_list_for_complaint(req, res, next){
    try {
        const {id} = req;
        give_list_for_complaint('VEHICLE', id);
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'vehicles_list_for_complaint';
        return next(error);
    }
}

export async function complaint_on_a_vehicle(req, res, next){
    try {
        const {id} = req;
        const {vehicle_id} = req.params;
        const {complaint} = req.body;
        complaint_on_a_specificthing(id, "VEHICLE", vehicle_id, complaint);
        return res.status(201).json({msg : "Successfully raised a request on a driver."});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'complaint_on_a_vehicle';
        return next(error);
    }
}

/**
 * OPTIONAL ROUTES: co-passengers_list_for_complaint, complaint_on_a_co-passenger
 */


export async function rating_a_driver(req, res, next){
    try {
        const {id} = req;
        const {driver_id} = req.params;
        const {rating} = req.body;
        const driver = await Driver.findById(driver_id);
        driver.individualRating.push(Number(rating));
        driver.rating = avg(driver.individualRating);
        await driver.save();

        return res.status(201).json({msg : "Successfully raised a request on a driver."});
    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'rating_a_driver';
        return next(error);
    }
}

export async function student_live_trip(req, res, next) {
    try {
        const {id} = req;
        const created = new Date(Date.now());

        const start = new Date(created);
        start.setHours(0, 0, 0, 0);

        const end = new Date(created);
        end.setHours(23, 59, 59, 999);

        const trips = await Trips.findOne({
            studentIds:id,
            tripStatus:"ONGOING",
            createdAt:{$gte:start, $lte:end}
        })
        return res.status(200).json({current_trip:trips});

        // Here we need to integrate the websocket part.....

    } catch (error) {
        error.status_code = 500;
        error.msg = 'Internal server error';
        error.function_name = 'student_live_trip';
        return next(error);
    }
}

