import { catchAsync } from "../utils/catchAsync.js";
import WishList from "../models/wishListModel.js";
import AppError from "../utils/appError.js";

export const getAllWishListItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const wishListItems = await WishList.find({ user: userId })
    .populate("user")
    .populate("items.game");

  if (!wishListItems || wishListItems.length === 0) {
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
  const { gameId } = req.body;

  let wishList = await WishList.findOne({ user: userId });

  if (wishList) {
    const gameIndex = wishList.items.findIndex(
      (item) => item.game.toString() === gameId
    );

    if (gameIndex > -1) {
      // If the game already exists in the wishlist, send an error
      return next(new AppError("Item already exists in wishlist", 400));
    } else {
      // If the game is not in the wishlist, add it
      wishList.items.push({ game: gameId });
    }
    await wishList.save();
  } else {
    // Wishlist does not exist, so create it with the new item
    wishList = await WishList.create({
      user: userId,
      items: [
        {
          game: gameId,
        },
      ],
    });

    if (!wishList) {
      return next(new AppError("Unable to add item to wishlist", 500));
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      wishList,
    },
  });
});

export const removeFromWishList = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const gameId = req.params.gameId;

  const wishList = await WishList.findOne({ user: userId });

  if (!wishList) {
    return next(new AppError("No wishlist found", 404));
  }

  const itemIndex = wishList.items.findIndex(
    (item) => item.game.toString() === gameId
  );

  if (itemIndex === -1) {
    return next(new AppError("Game not found in wishlist", 404));
  }

  wishList.items.splice(itemIndex, 1);
  await wishList.save();

  res.status(200).json({
    status: "success",
  });
});
