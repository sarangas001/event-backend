const User = require('../models/User.js')

// create lecture profile
const createLectureProfile = async (req, res) => {
    try {
        const { fullName, facultyName, position, universityEmail, registrationNumber, phoneNumber, notificationTypes, deliveryChannels, userId } = req.body;

        if (!fullName) {
            return res.send({ success: false, message: "Missing Full Name" });
        }
        if (!facultyName) {
            return res.send({ success: false, message: "Missing Faculty Name" });
        }
        if (!position) {
            return res.send({ success: false, message: "Missing Position" });
        }
        if (!universityEmail) {
            return res.send({ success: false, message: "Missing University Email" });
        }
        if (!registrationNumber) {
            return res.send({ success: false, message: "Missing Registration Number" });
        }
        if (!phoneNumber) {
            return res.send({ success: false, message: "Missing Phone Number" });
        }

        // find user by id
        const user = await User.findById(userId);
        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }

        const response = await User.updateOne({_id: userId}, {$set: {fullName, adminProfile: {role: 'lecture'} , lectureProfile: {facultyName, position, universityEmail}, regiNumber: registrationNumber,  contactNum: phoneNumber}} );

        if (!response) {
            return res.send({ success: false, message: "Failed to create student profile" });
        }

        return res.send({ success: true, message: "Student profile created successfully" });


    }catch (error) {
        //Send error message when it is cause error
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

const getLectureProfile = async (req, res) => {
    try {
        const {userId} = req.body;
        

        const user = await User.findById(userId);

        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }

        const lectureProfile = {
            fullName: user.fullName,
            email: user.email,
            adminProfile: user.adminProfile,
            isAccountVerified: user.isAccountVerified,
            contactNum: user.contactNum,
            lectureProfile: user.lectureProfile,
            regiNumber: user.regiNumber
        };

        return res.send({ success: true, message: lectureProfile });

    } catch (error) {
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

exports.createLectureProfile = createLectureProfile;
exports.getLectureProfile = getLectureProfile;