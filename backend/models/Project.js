const mongoose = require('mongoose');

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    projectName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    organizationAuthorityType: {
      type: String,
      enum: ['advisor', 'dean'],
      required: true,
    },
    organizationAuthorityRef: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    president: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Project', projectSchema);
