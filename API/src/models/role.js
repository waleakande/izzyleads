import mongoose from 'mongoose';

const Role = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },
    lowerCaseName: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
      lowercase: true
    },

    displayOrder: Number,
  },
  { timestamps: true },
);

export default mongoose.model('Role', Role);
