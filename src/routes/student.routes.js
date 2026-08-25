import {getMe, logOut, changePassword, studentBookingAuto, student_bookings, student_specific_booking, delete_student_booking, get_student_trips_details, get_a_trip_details, drivers_list, complaint_on_a_driver, vehicles_list_for_complaint, complaint_on_a_vehicle, rating_a_driver, student_live_trip} from '../controllers/student.controllers.js';
import express from 'express';

const app = express.Router();

app.use("/logout", logOut);
app.use("/changepassword", changePassword);
app.use("/me", getMe);
app.use("/students/book-auto", studentBookingAuto);
app.use("/students/bookings", student_bookings);
app.use("/students/bookings/:booking_id", student_specific_booking);
app.use("/students/bookings/:booking_id", delete_student_booking);
app.use("/students/trips", get_student_trips_details);
app.use("/students/trips/:tripId", get_a_trip_details);
app.use("/students/drivers", drivers_list);
app.use("/students/drivers/:driver_id", complaint_on_a_driver);
app.use("/students/vehicles/", vehicles_list_for_complaint);
app.use("/students/vehicles/:vehicle_id", complaint_on_a_vehicle);
app.use("/students/drivers/:driver_id", rating_a_driver);
app.use("/students/live-trip", student_live_trip);

export default app;