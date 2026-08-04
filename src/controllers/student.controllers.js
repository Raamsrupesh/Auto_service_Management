import {User} from '../models/user.model.js'
import {Student} from '../models/student.model.js'

export async function changePassword(req, res) {
    try {
        const {email, old_password, new_password} = req.body;
        const id = req.id;

        const act_user = await User.findById(id);

        if(!act_user) return res.status(400).json({msg : "NO User exists!"});

        if(act_user.email !== email) return res.status(400).json({msg : "Incorrect Email!!"});
        const isCrtpswd = await argon2.verify(act_user.password, old_password);

        if(isCrtpswd){
            const encryptedPswd = await argon2.hash(new_password);
            act_user.password=encryptedPswd;
            act_user.save();
            return res.status(200).json({msg : "Successfully Updated the password!!"});
        }

        return res.status(400).json({msg : "Password is incorrect!"});
        
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'changePassword',
            success: false,
        });
        process.exit(1);

    }
}

export async function getMe(req, res){
    try {
        const id = req.id;
        const act_user = await User.findById(id);
        
        if(!act_user) return res.status(400).json({msg:"No user exists!"});
        
        if(act_user.role === "Student"){
            const student = await Student.findOne({userId:id});
            return res.status(200).json({msg : {user:act_user, student}});
        }
        else if(act_user.role === "AutoDriver"){
            const driver = await Driver.findOne({userId:id});
            return res.status(200).json({msg : {user:act_user, driver}});
        }
        else if(act_user.role !== "ADMIN"){
            return res.status(200).json({msg : {user:act_user}});
        }
        
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'getMe',
            success: false,
        });
        process.exit(1);
    }
}

export async function logOut(req, res) {
    try {
        const {refreshToken} = req.body;
        const id = req.id;
        const act_user = await User.findById(id);
        
        if(!act_user) return res.status(400).json({msg : "No User Exists!!"});
        
        act_user.refreshtoken = null;
        act_user.save();
        
        return res.status(200).json({msg : "Successfully Logged OUT!"});
        
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({
            msg: 'Internal server error',
            function:'logOut',
            success: false,
        });
        process.exit(1);
    }
}

export async function studentBookingAuto(req, res){
    
}