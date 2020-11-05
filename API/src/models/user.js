import mongoose from 'mongoose';

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },
    lowerCaseName: {
      type: String,
      lowercase: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    password: String,

    salt: String,

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    superAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    emailVerifiedAt: Date,
    resetPasswordToken: {
      type: String,
      required: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      required: false,
      index: true,
    },
    resetPasswordTokenExpires: Date,
  },
  { timestamps: true },
);

User.pre('save', function(next, done) {
  this.lowerCaseName = this.name.toLowerCase();
  next();
});

export default mongoose.model('User', User);
