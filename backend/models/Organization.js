const mongoose = require('mongoose');

const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    organizationName: { type: String, required: true, trim: true, unique: true },
    organizationType: {
      type: String,
      required: true,
      enum: ['noFaculty', 'withFaculty'],
    },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', default: null },
    advisor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    presidentName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true },
    projectCount: { type: Number, default: 0, min: 0 },
    authorityType: {
      type: String,
      enum: ['advisor', 'dean'],
      default: 'advisor',
    },
    authorityRef: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

organizationSchema.pre('validate', function validateOrganization(next) {
  if (this.organizationType === 'noFaculty') {
    this.faculty = null;
    this.authorityType = 'advisor';
  }

  if (this.organizationType === 'withFaculty') {
    this.advisor = null;
    this.authorityType = 'dean';
  }

  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
