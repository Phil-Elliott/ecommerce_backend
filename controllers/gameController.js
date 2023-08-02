import Game from "../models/gameModel.js";
import * as factory from "./handlerFactory.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createGame = factory.createOne(Game);

export const getAllGames = factory.getAll(Game);

export const getGame = factory.getOne(Game);

export const updateGame = factory.updateOne(Game);

export const deleteGame = factory.deleteOne(Game);

// Gets all of the game categories, platforms, and publishers
export const getFilterOptions = catchAsync(async (req, res, next) => {
  const categories = await Game.find().distinct("category");
  const platforms = await Game.find().distinct("platform");
  const publishers = await Game.find().distinct("publisher");

  res.status(200).json({
    status: "success",
    data: {
      categories,
      platforms,
      publishers,
    },
  });
});
