import { catchAsync } from "../utils/catchAsync.js";

export const getAllWishListItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const wishListItems = await WishList.find({ userId: userId });
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
  await WishList.findOneAndDelete({ userId, productId });
  res.status(200).json({
    status: "success",
  });
});
