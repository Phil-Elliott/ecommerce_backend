import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must belong to a User"],
    },
    game: {
      type: mongoose.Schema.ObjectId,
      ref: "Game",
      required: [true, "A review must belong to a Product"],
    },
    review: {
      type: String,
      required: [true, "A review must have a review"],
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: 0,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "game",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name",
  // });

  this.populate({
    path: "user",
    select: "name",
  });

  next();
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
