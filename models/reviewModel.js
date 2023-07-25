import mongoose from "mongoose";
import Game from "./gameModel.js";

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
      minlength: [
        10,
        "A review headline must have more or equal than 10 characters",
      ],
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: 1,
      max: 5,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "A review headline must have less or equal than 100 characters",
      ],
      minlength: [3, "A review must have more or equal than 3 characters"],
    },
    upVotes: {
      type: Number,
      default: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
    },
    recommended: {
      type: Boolean,
      default: false,
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
  this.populate({
    path: "user",
    select: "name",
  });

  next();
});

reviewSchema.statics.calcStarRatings = async function (gameId) {
  const stats = await this.aggregate([
    {
      $match: { game: gameId },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  console.log(stats);

  // Initialize the starRatings object with zero counts
  let starRatings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (stats.length > 0) {
    stats.forEach((stat) => {
      // Update the count for each rating present in the reviews
      starRatings[stat._id] = stat.count;
    });
  }

  await Game.findByIdAndUpdate(gameId, {
    starRatings: starRatings,
  });
};

reviewSchema.statics.calcAverageRatings = async function (gameId) {
  const stats = await this.aggregate([
    {
      $match: { game: gameId },
    },
    {
      $group: {
        _id: "$game",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Game.findByIdAndUpdate(gameId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Game.findByIdAndUpdate(gameId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.game);
  this.constructor.calcStarRatings(this.game);
});

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // check if doc exists
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.game);
    await doc.constructor.calcStarRatings(doc.game);
  }
  next();
});

reviewSchema.post("remove", function (doc) {
  doc.constructor.calcAverageRatings(doc.game);
  doc.constructor.calcStarRatings(doc.game);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calcAverageRatings(this.r.game);
//   await this.r.constructor.calcStarRatings(this.r.game);
// });
