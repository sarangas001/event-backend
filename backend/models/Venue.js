const mongoose = require('mongoose');

const { Schema } = mongoose;

const venueSchema = new Schema(
  {
    venueName: { type: String, required: true, trim: true, unique: true },
    capacity: { type: Number, required: true, min: 1 },
    type: { type: String, required: true, trim: true },
    ownerType: {
      type: String,
      required: true,
      enum: ['Welfare', 'Dean', 'Sports Director'],
    },
    ownerRef: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Venue', venueSchema);
