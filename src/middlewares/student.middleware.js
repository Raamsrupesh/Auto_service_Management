import jwt from 'jsonwebtoken';
import { Student } from '../models/student.model.js';
export default async function isStudent(req, res, next){
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
        if(payload.role !== "Student"){
            return res.status(400).json({msg : "Invalid role exists!!"});
        }

        const act_stu = await Student.findOne({userId: payload.id})
        req.id = act_stu._id;
        req.role = payload.role;

        next();
    } catch (error) {
        return res.status(500).json({msg : "Something Went Wrong!!"});
    }
}