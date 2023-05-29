import { catchAsync } from "../utils/catchAsync.js";

export const getAllCartItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Get this from the authenticated user
  const cartItems = await Cart.find({ userId: userId });
  res.status(200).json({
    status: "success",
    data: {
      cartItems,
    },
  });
});

export const addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const newCartItem = await Cart.create({ userId, productId, quantity });
  res.status(200).json({
    status: "success",
    data: {
      newCartItem,
    },
  });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;
  await Cart.findOneAndDelete({ userId, productId });
  res.status(200).json({
    status: "success",
  });
});
