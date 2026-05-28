const mongoose = require('mongoose');

const { Schema } = mongoose;

const workflowHistorySchema = new Schema(
  {
    stage: { type: String, required: true },
    role: { type: String, required: true },
    decision: { type: String, enum: ['approved', 'rejected', 'submitted', 'uploaded'], required: true },
    comment: { type: String, default: '' },
    actor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const workFlowSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    currentStage: {
      type: String,
      enum: [
        'organizationAuthority',
        'welfareOfficer',
        'venueOwner',
        'categoryCheck',
        'securityUpload',
        'proctor',
        'viceChancellor',
        'welfareFinal',
        'approved',
        'returnedToPresident',
      ],
      default: 'organizationAuthority',
    },
    currentRole: { type: String, default: 'advisor' },
    currentAssignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['pending', 'returned', 'approved', 'rejected'],
      default: 'pending',
    },
    requiresSecurity: { type: Boolean, default: false },
    securityImageUrl: { type: String, default: '' },
    securitySubmittedAt: { type: Date, default: null },
    history: { type: [workflowHistorySchema], default: [] },
    returnedToPresidentAt: { type: Date, default: null },
    finalApprovedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model('WorkFlow', workFlowSchema);
