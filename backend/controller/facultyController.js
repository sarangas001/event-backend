const Faculty = require('../models/Faculty.js')

// Get all faculty 
const getAllFaculty = async (req, res) => {
    try {

        const faculty = await Faculty.find().populate('dean', 'fullName email adminProfile');

        if (!faculty) {
            return res.send({ success: false, message: "No faculty found" });
        }

        return res.send({ success: true, message: faculty });

    } catch (error) {
        return res.send({ success: false, message: `Error : ${error.message}` })
    }
}

exports.getAllFaculty = getAllFaculty;
