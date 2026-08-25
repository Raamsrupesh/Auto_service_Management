import express from "express";
import { register, login, logOut, verifyEmail, refreshToken, changePassword, forgotPassword, forgotPasswordOTPCheck, getMe, resetPasswordOTPCheck, uploadImage } from "../controllers/auth.controllers.js";
import upload from "../middlewares/multer.js";
const app = express.Router();

app.use("/register", register);
app.use("/login", login);
app.use("/refreshtoken", refreshToken);
app.use("/resetpassword", resetPasswordOTPCheck);
app.use("/verifyemail", verifyEmail);
app.use("/forgotpassword", forgotPassword);
app.use("/forgotpasswordOTP", forgotPasswordOTPCheck);
app.use("/upload-pic", upload.single("image"), uploadImage);

export default app;