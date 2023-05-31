import { catchAsync } from "../utils/catchAsync.js";
import WishList from "../models/wishListModel.js";
import AppError from "../utils/appError.js";

export const getAllWishListItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const wishListItems = await WishList.find({ userId: userId });

  if (!wishListItems) {
    return next(new AppError("No wishlist items found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      wishListItems,
    },
  });
});

export const addToWishList = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;
  const newWishListItem = await WishList.create({ userId, productId });

  if (!newWishListItem) {
    return next(new AppError("Unable to add item to wishlist", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      newWishListItem,
    },
  });
});

export const removeFromWishList = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;
  const deletedItem = await WishList.findOneAndDelete({ userId, productId });

  if (!deletedItem) {
    return next(new AppError("Unable to remove item from wishlist", 500));
  }

  res.status(200).json({
    status: "success",
  });
});
