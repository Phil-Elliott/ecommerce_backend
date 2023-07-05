import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A review must belong to a User"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "A review must belong to a Product"],
  },
  review: {
    type: String,
    required: [true, "A review must have a review"],
  },
  rating: {
    type: Number,
    required: [true, "A review must have a rating"],
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
