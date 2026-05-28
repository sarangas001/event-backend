const User = require('../models/User.js')

const getUserProfile = async (req, res) => {

    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.send({ success: false, message: "User not found" });
        }
        const filtredUser = {
            fullName: user.fullName,
            email: user.email,
            department: user.adminProfile?.department || user.studentProfile?.department || user.lectureProfile?.facultyName || "",
            role: user.adminProfile?.role || (user.studentProfile ? "student" : user.lectureProfile ? "lecture" : ""),
            adminProfile: user.adminProfile,
            studentProfile: user?.studentProfile,
            lectureProfile: user?.lectureProfile,
            regiNumber: user.regiNumber,
            isAccountVerified: user.isAccountVerified,
            contactNum: user.contactNum,
        };
        res.send({ success: true, user: filtredUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
};

module.exports = { getUserProfile };
