import Game from "../models/gameModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";
import cloudinary from "cloudinary";
import fs from "fs";
import stream from "stream";

// Configuration
// cloudinary.config({
//   cloud_name: "djdxd5akb",
//   api_key: "266773556796236",
//   api_secret: "HUhHCzo9bAmt6Qba-8vvOU2tUbY",
// });

export const createGame = catchAsync(async (req, res, next) => {
  const newGame = await Game.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      game: newGame,
    },
  });
});

export const getAllGames = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Game.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const games = await features.query;

  res.status(200).json({
    status: "success",
    results: games.length,
    data: {
      games,
    },
  });
});

export const getGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return next(new AppError("No game found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      game,
    },
  });
});

export const updateGame = catchAsync(async (req, res, next) => {
  const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!game) {
    return next(new AppError("No game found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      game,
    },
  });
});

export const deleteGame = catchAsync(async (req, res, next) => {
  const game = await Game.findByIdAndDelete(req.params.id);

  if (!game) {
    return next(new AppError("No game found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
