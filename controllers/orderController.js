import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Game from "../models/gameModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim());

  const cart = req.body.cart;

  if (!cart || cart.length === 0) {
    return next(new AppError("No items in the cart", 400));
  }

  // Fetch all products from the cart in a single query
  const productIds = cart.map((item) => item.gameId);
  const products = await Game.find({ _id: { $in: productIds } });

  if (products.length !== cart.length) {
    return next(new AppError("Some products in the cart were not found", 404));
  }

  let total = 0;
  const line_items = [];

  for (const item of cart) {
    const product = products.find(
      (prod) => prod._id.toString() === item.gameId
    );
    const quantity = item.quantity;

    total += product.price * quantity;

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${product.name} Game`,
          description: product.description,
          // images: [`https://www.gaming-ecommerce.com/img/games/${product.image}`],
        },
        unit_amount: Math.round(product.price * 100), // Use Math.round to ensure you have an integer value
      },
      quantity: quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    // have the success url go to the orders page
    success_url: `http://localhost:3001/`,
    cancel_url: `http://localhost:3001/cart`,
    customer_email: req.user.email,
    // client_reference_id: 123, // You can adjust this or leave it out if not needed
    line_items: line_items,

    mode: "payment", // Adding the mode here
  });

  // Save the order to your database (without marking as paid), if desired.
  // After successful payment via Stripe, you can update the order status.

  res.status(200).json({
    status: "success",
    session,
  });
});

export const createOrderCheckout = catchAsync(async (req, res, next) => {
  const { user, items, total } = req.body;

  if (!user || !items || !total) {
    return next(new AppError("Missing required fields", 400));
  }

  const order = await Order.create({
    user,
    items,
    total,
  });

  res.status(201).json({
    status: "success",
    data: {
      order,
    },
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
