const User = require('../models/User.js')

const createOrinizerProfile = async (req, res) => {
    try {
        
        const { fullName, clubSociety, position, advisorName, advisorEmail, universityEmail, registrationNumber ,phoneNumber,  userId,notificationTypes,deliveryChannels} = req.body;

        if (!fullName) {
            return res.send({ success: false, message: "Missing Full Name" });
        }
        if (!clubSociety) {
            return res.send({ success: false, message: "Missing Club/Society" });
        }
        if (!universityEmail) {
            return res.send({ success: false, message: "Missing University Email" });
        }
        if (!phoneNumber) {
            return res.send({ success: false, message: "Missing Phone Number" });
        }
        if (!registrationNumber) {
            return res.send({ success: false, message: "Missing Registration Number" });
        }
        if (!advisorEmail) {
            return res.send({ success: false, message: "Missing Advisor Email" });
        }
        if (!advisorName) {
            return res.send({ success: false, message: "Missing Advisor Name" });
        }
        if (!position) {
            return res.send({ success: false, message: "Missing Position" });
        }

        // find user by id
        const user = await User.findById(userId);

        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }

        const response = await User.updateOne({_id: userId}, {$set: {fullName, adminProfile: {role: 'president'}, organizerProfile: {clubSociety, position, advisorName, advisorEmail}, regiNumber: registrationNumber, contactNum: phoneNumber }} );

        if (!response) {
            return res.send({ success: false, message: "Failed to create organizer profile" });
        }

        return res.send({ success: true, message: "Organizer profile created successfully" });

    } catch (error) {
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

const getAllOrginzers = async (req, res) => {
    try {
        
        const {userId} = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }

        const organizer = {
            fullName: user.fullName,
            email: user.email,
            adminProfile: user.adminProfile,
            isAccountVerified: user.isAccountVerified,
            contactNum: user.contactNum,
            organizerProfile: user.organizerProfile,
            regiNumber: user.regiNumber
        }

        return res.send({ success: true, message: organizer });

    } catch (error) {
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

exports.createOrinizerProfile = createOrinizerProfile;
exports.getAllOrginzers = getAllOrginzers;