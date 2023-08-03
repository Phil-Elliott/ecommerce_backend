import Game from "../models/gameModel.js";
import * as factory from "./handlerFactory.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createGame = factory.createOne(Game);

export const getAllGames = factory.getAll(Game);

export const getGame = factory.getOne(Game);

export const updateGame = factory.updateOne(Game);

export const deleteGame = factory.deleteOne(Game);

// Gets all of the game categories, platforms, publishers, and game modes
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

// Gets 10 random products from the database (return only id, name, price, and image)
export const getRandomProducts = catchAsync(async (req, res, next) => {
  const products = await Game.aggregate([
    { $sample: { size: 10 } },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        image: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      products,
    },
  });
});
