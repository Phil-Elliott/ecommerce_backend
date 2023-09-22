import Stripe from "stripe";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Game from "../models/gameModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

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

  // Save the order to your database with "pending" status
  const orderItems = cart.map((item) => {
    const product = products.find(
      (prod) => prod._id.toString() === item.gameId
    );
    return {
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const newOrder = await Order.create({
    user: req.user.id,
    items: orderItems,
    total: total,
    orderStatus: "pending",
  });

  console.log(newOrder._id.toString(), "new order");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    // have the success url go to the orders page
    success_url: `http://localhost:3001/`,
    cancel_url: `http://localhost:3001/cart`,
    customer_email: req.user.email,
    client_reference_id: newOrder._id.toString(), // You can adjust this or leave it out if not needed
    line_items: line_items,
    mode: "payment", // Adding the mode here
  });

  console.log(session, "session");

  // Save the order to your database (without marking as paid), if desired.
  // After successful payment via Stripe, you can update the order status.

  res.status(200).json({
    status: "success",
    session,
  });
});

const createOrderCheckout = async (session) => {
  // console.log("session", session);
  // const order = session.client_reference_id;
  // console.log(order, "orderID");
  // const user = (await User.findOne({ email: session.customer_email })).id;
  // const price = session.display_items[0].amount / 100;
  // await Order.findByIdAndUpdate(order, { orderStatus: "paid" });

  // Retrieve order's ID from metadata
  const orderId = session.client_reference_id;
  console.log(session.display_items, "display items");
  const id = new mongoose.Types.ObjectId(orderId);
  console.log("id", id);

  // if (orderId) {
  try {
    console.log("new order");
    // const newOrder = await Order.findByIdAndUpdate(
    //   session.client_reference_id,
    //   {
    //     orderStatus: "paid",
    //   }
    // );
    const newOrder = await Order.findById(orderId).exec();
    console.log("new order 2");
    console.log("new order 3", newOrder);
  } catch (error) {
    console.log("Error fetching order:", error.message);
  }
  // }
};

export const handleStripeWebhook = async (req, res, next) => {
  const event = req.body;

  switch (event.type) {
    case "payment_intent.succeeded":
      // console.log("pmt", event.data.object.)
      console.log("PaymentIntent was successful!");
      break;
    case "checkout.session.completed":
      console.log("Checkout session completed");
      await createOrderCheckout(event);
      break;
    case "payment_method.attached":
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  // res.send({ received: true });
  res.status(200).json({ received: true });
};

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

// const handleCheckoutSessionCompleted = async (event) => {
//   const session = event.data.object;
//   console.log(`Checkout session for ${session.amount_total} was successful!`);

//   const orderId = session.metadata.order_id;
//   if (orderId) {
//     const id = new mongoose.Types.ObjectId(orderId);
//     console.log("id", id);
//     try {
//       const order = await Order.findById(id);
//       console.log("order", order);
//       if (order) {
//         order.orderStatus = "paid";
//         await order.save();
//         console.log("order status", order.orderStatus);
//       } else {
//         console.log("Order not found in the database.");
//       }
//     } catch (error) {
//       console.log("Error fetching order:", error.message);
//     }
//   } else {
//     console.log("no order id");
//   }
// };

// export const createOrderCheckout = catchAsync(async (req, res, next) => {
//   const { user, items, total } = req.body;

//   if (!user || !items || !total) {
//     return next(new AppError("Missing required fields", 400));
//   }

//   const order = await Order.create({
//     user,
//     items,
//     total,
//   });

//   res.status(201).json({
//     status: "success",
//     data: {
//       order,
//     },
//   });
// });

// export const handleStripeWebhook = (req, res, next) => {
//   console.log("Its running");
//   const event = req.body;

//   console.log(event.type);

//   if (event.type === "checkout.session.completed") {
//     console.log("Checkout session completed");
//     createOrderCheckout(event.data.object);
//   }

//   res.status(200).json({ received: true });
// };

// export const handleStripeWebhook = async (req, res, next) => {
//   const event = req.body;
//   console.log("event", event);

//   // res.status(200).send();

//   switch (event.type) {
//     case "checkout.session.completed":
//       const session = event.data.object;

//       console.log(session.client_reference_id, "client reference id");

//       // Retrieve order's ID from metadata
//       const orderId = session.client_reference_id;

//       const id = new mongoose.Types.ObjectId(orderId);
//       console.log("id", id);

//       if (orderId) {
//         try {
//           const newOrder = await Order.findByIdAndUpdate(id, {
//             orderStatus: "paid",
//           });
//           console.log(newOrder, "new order");
//         } catch (error) {
//           console.log("Error fetching order:", error.message);
//         }
//       }

//       break;
//     // ... other cases
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   // res.status(200).end();
//   res.status(200).json({ received: true });
// };
