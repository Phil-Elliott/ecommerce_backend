import { catchAsync } from "../utils/catchAsync.js";
import Cart from "../models/cartModel.js";
import AppError from "../utils/appError.js";

export const getAllCartItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cartItems = await Cart.find({ user: userId })
    .populate("user")
    .populate("items.game");

  if (!cartItems || cartItems.length === 0) {
    return next(new AppError("No cart items found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      cartItems,
    },
  });
});

export const addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { gameId, quantity = 1 } = req.body; // Sets quantity to 1 if it is undefined or null

  // First try to find an existing Cart for the user
  let cart = await Cart.findOne({ user: userId });

  if (cart) {
    // Cart exists, so update it with the new item
    const itemIndex = cart.items.findIndex(
      (item) => item.game.toString() === gameId
    );

    if (itemIndex > -1) {
      // If the game already exists in the cart, update the quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // If the game is not in the cart, add it
      cart.items.push({ game: gameId, quantity });
    }
    await cart.save();
  } else {
    // Cart does not exist, so create it with the new item
    cart = await Cart.create({
      user: userId,
      items: [
        {
          game: gameId,
          quantity,
        },
      ],
    });

    if (!cart) {
      return next(new AppError("Unable to add item to cart", 500));
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const gameId = req.params.gameId;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  const itemIndex = cart.items.findIndex((item) => {
    return item.game.toString() === gameId;
  });

  if (itemIndex === -1) {
    return next(new AppError("Game not found in cart", 404));
  }

  // Remove the item from the cart
  cart.items.splice(itemIndex, 1);

  // If cart is empty after removing the item, delete the cart
  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
  } else {
    await cart.save();
  }

  res.status(200).json({
    status: "success",
  });
});

export const changeQuantity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const gameId = req.body.gameId;
  const quantity = req.body.quantity;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  const itemIndex = cart.items.findIndex((item) => {
    return item.game.toString() === gameId;
  });

  if (itemIndex === -1) {
    return next(new AppError("Game not found in cart", 404));
  }

  // Change the quantity of the item in the cart
  if (quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  cart.items[itemIndex].quantity = quantity;

  await cart.save();

  res.status(200).json({
    status: "success",
  });
}
);