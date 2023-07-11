import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A game must have a name"],
      unique: true,
    },
    image: {
      type: [String],
      required: [true, "A game must have an image"],
    },
    price: {
      type: Number,
      required: [true, "A game must have a price"],
    },
    description: {
      type: String,
      required: [true, "A game must have a description"],
    },
    category: {
      type: [String],
      required: [true, "A game must have a category"],
    },
    publisher: {
      type: String,
      // required: [true, "A game must have a publisher"],
    },
    releaseDate: {
      type: Date,
      // required: [true, "A game must have a release date"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    playerCount: {
      type: Number,
      // required: [true, "A game must have a player count"],
    },
    platform: {
      type: String,
      // required: [true, "A game must have a platform"],
    },
    gameModes: {
      type: [String],
      // required: [true, "A game must have at least one game mode"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    stock: {
      type: Number,
      required: [true, "A game must have a stock"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual populate
gameSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "game",
  localField: "_id",
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
