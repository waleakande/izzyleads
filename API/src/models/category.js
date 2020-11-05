import mongoose from 'mongoose';

const Category = new mongoose.Schema(
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

    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
    ],

    displayOrder: Number,
  },
  { timestamps: true },
);

Category.pre('save', function(next, done) {
  this.lowerCaseName = this.name.toLowerCase();
  next();
});

export default mongoose.model('Category', Category);
