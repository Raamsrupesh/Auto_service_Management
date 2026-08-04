import express from "express";
import authRouter from './routes/auth.routes.js'
import studentRouter from './routes/student.routes.js';
import autodriverRouter from './routes/autodriver.routes.js';
import isLoggedIn from './middlewares/auth.middleware.js'
const app = express();


app.use("/api/auth/v1/", authRouter);
app.use("/api/student/v1", isLoggedIn, studentRouter)
app.use("/api/autodriver/v1", isLoggedIn, autodriverRouter);


export default app;