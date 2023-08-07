import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import Order from "../models/orderModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const cartItems = req.body.cartItems;
  const lineItems = [];

  // create an order in your database
  const order = await Order.create({
    user: req.user.id,
    cartItems: cartItems,
  });

  for (const item of cartItems) {
    const game = await Game.findById(item.gameId);

    if (!game) {
      return next(new AppError(`No game found with ID ${item.gameId}`, 404));
    }

    lineItems.push({
      name: `${game.name} Game`,
      description: game.description,
      amount: game.price * 100,
      currency: "usd",
      quantity: item.quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: order.id,
    line_items: lineItems,
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

export const createOrder = catchAsync(async (req, res, next) => {
  // user id should come from the authenticated user
  const newOrder = await Order.create({
    user: req.user.id,
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    data: {
      order: newOrder,
    },
  });
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

export const updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
