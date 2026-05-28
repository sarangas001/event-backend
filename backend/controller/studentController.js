const User = require('../models/User.js')

// create student profile
const createStudentProfile = async (req, res) => {
    try {
        const { fullName, universityEmail, phoneNumber, notificationTypes, deliveryChannels, userId } = req.body;

        if (!fullName) {
            return res.send({ success: false, message: "Missing Full Name" });
        }

        if (!universityEmail) {
            return res.send({ success: false, message: "Missing University Email" });
        }

        if (!phoneNumber) {
            return res.send({ success: false, message: "Missing Phone Number" });
        }

        // find user by id
        const user = await User.findById(userId);
        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }

        const studentProfile = {
            universityEmail: universityEmail,
        }

        const response = await User.updateOne({_id: userId}, {$set: {fullName, studentProfile, contactNum: phoneNumber}} );

        if (!response) {
            return res.send({ success: false, message: "Failed to create student profile" });
        }

        return res.send({ success: true, message: "Student profile created successfully" });


    }catch (error) {
        //Send error message when it is cause error
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

const getStudentProfile = async (req, res) => {

    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }

        const filtredUser = {
            fullName: user.fullName,
            email: user.email,
            contactNum: user.contactNum,
            adminProfile: user.adminProfile,
            studentProfile: user.studentProfile,
            isAccountVerified: user.isAccountVerified
        }
        
        return res.send({message: filtredUser, success: true});

    } catch (error) {
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

exports.createStudentProfile = createStudentProfile;
exports.getStudentProfile = getStudentProfile;