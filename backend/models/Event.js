const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    eventDate: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    expectedAttendees: { type: Number, required: true, min: 1 },
    venueName: { type: String, required: true, trim: true },
    venue: { type: Schema.Types.ObjectId, ref: 'Venue', default: null },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    president: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverImageUrl: { type: String, default: '' },
    classroomName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'pending', 'returned', 'approved', 'rejected'],
      default: 'pending',
    },
    approvalStage: { type: String, default: 'organizationAuthority' },
    approvalRole: { type: String, default: 'advisor' },
    requiresSecurity: { type: Boolean, default: false },
    securityImageUrl: { type: String, default: '' },
    securityUploadedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    publicVisible: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Event', eventSchema);
