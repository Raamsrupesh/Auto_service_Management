import {getMe, logOut, changePassword} from '../controllers/student.controllers.js';
import express from 'express';
const app = express.Router();

app.use("/logout", logOut);
app.use("/changepassword", changePassword);
app.use("/me", getMe);

export default app;