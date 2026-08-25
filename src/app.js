import express from "express";
import authRouter from './routes/auth.routes.js'
import studentRouter from './routes/student.routes.js';
import autodriverRouter from './routes/autodriver.routes.js';
import isLoggedIn from './middlewares/auth.middleware.js';
import {error_response} from './utils/error-response.js';
import isAutoDriver from './middlewares/autodriver.middleware.js'
import isStudent from './middlewares/student.middleware.js'
const app = express();


app.use("/api/auth/v1/", authRouter);
app.use("/api/student/v1", isLoggedIn, isStudent, studentRouter);
app.use("/api/auto-driver/v1", isLoggedIn, isAutoDriver, autodriverRouter);

app.use(error_response)
export default app;