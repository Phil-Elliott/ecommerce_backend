import Game from "../models/gameModel.js";
import * as factory from "./handlerFactory.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

export const createGame = factory.createOne(Game);

export const getAllGames = factory.getAll(Game);

export const getGame = factory.getOne(Game);

export const updateGame = factory.updateOne(Game);

export const deleteGame = factory.deleteOne(Game);
