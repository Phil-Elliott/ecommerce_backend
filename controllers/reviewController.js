import Review from "../models/reviewModel.js";
import * as factory from "./handlerFactory.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.game) req.body.game = req.params.gameId;
  if (!req.body.user) req.body.user = req.user.id;

  // user can only create one review per product
  const review = await Review.findOne({
    user: req.body.user,
    game: req.body.game,
  });

  if (review) {
    return next(new AppError("You have already reviewed this product", 400));
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

export const getAllReviews = factory.getAll(Review);

export const getReview = factory.getOne(Review);

export const updateReview = factory.updateOne(Review);

export const deleteReview = factory.deleteOne(Review);
