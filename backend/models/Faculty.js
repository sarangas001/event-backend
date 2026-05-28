const mongoose = require('mongoose')
const Schema = mongoose.Schema

const facultySchema = new Schema({
    facultyName: { type: String, required: true, trim: true, unique: true },
    departments: { type: [String], required: true, default: [] },
    dean: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

const Faculty = mongoose.model("Faculty", facultySchema)

module.exports = Faculty;
