import { Complaints } from "../models/complaints.model.js";
import { Driver } from "../models/driver.model.js";
import { Trips } from "../models/trips.model.js";
import { Vehicles } from "../models/vehicles.model.js";

export async function give_list_for_complaint(on, id){
        const trips = await Trips.find(
            {studentIds: id}
        );

        if(on === "DRIVER"){
            const drivers = await Driver.findById(trips.driverId);
            return drivers;
        }
        else if(on === "VEHICLE"){
            const vehicles = await Vehicles.findById(trips.vehicleId)
            return vehicles;
        }
        else{
            return trips;
        }
}

export async function complaint_on_a_specificthing(studentId, on, OnId, complaint) {
    const comp = await Complaints.insertOne(
            {studentId, on, OnId, complaint}
    );
    return;
}