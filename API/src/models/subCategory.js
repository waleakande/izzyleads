import mongoose from 'mongoose';

const SubCategory = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },

    lowerCaseName: {
      type: String,
      index: true,
      lowercase: true,
    },

    published: {
      type: Boolean,
      default: false,
      required: true,
    },

    deletedAt: {
      type: Number,
      default: -1,
      required: false,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    displayOrder: Number,
  },
  { timestamps: true },
);

SubCategory.pre('save', function(next, done) {
  this.lowerCaseName = this.name.toLowerCase();
  next();
});

export default mongoose.model('SubCategory', SubCategory);
