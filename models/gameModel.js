import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, "A game must have a rating"],
    min: [0, "Rating must be between 0 and 5"],
    max: [5, "Rating must be between 0 and 5"],
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
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
