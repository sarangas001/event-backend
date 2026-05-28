const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // 👨‍💼 Admin Profile (only for admins)
  adminProfile: {
    department: { type: String },
    role: {
      type: String,
      enum: [
        "student",
        "lecture",
        "president",
        "advisor",
        "welfareOfficer",
        "dean",
        "sportsDirector",
        "chairmanOfArt",
        "proctor",
        "viceChancellor",
      ],
      default: "student",
    },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty", default: null },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
  },

  // 👨‍🎓 Student Profile (only for students)
  studentProfile: {
    faculty: { type: String },
    department: { type: String },
    universityEmail: { type: String, unique: true, sparse: true },
  },

  // 📅 Events organized (only for organizers)
  organizerProfile: {
    clubSociety: { type: String },
    position: { type: String },
    advisorName: { type: String},
    advisorEmail: { type: String},
  },

  // lecture profile
  lectureProfile: {
    facultyName: { type: String },
    position: { type: String },
    universityEmail: { type: String, unique: true, sparse: true },
  },

  contactNum: { type: String, unique: true, sparse: true },
  regiNumber: { type: String, unique: true, sparse: true }, // sparse = allow null for admins

  // 🔑 Auth fields
  password: { type: String, required: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 }
})

const User = mongoose.model("User", userSchema)

module.exports = User;
