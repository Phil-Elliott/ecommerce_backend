import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Game from "../models/gameModel.js";
import Cart from "../models/cartModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

// Generate Unique Order Number
const generateOrderNumber = async () => {
  // You can customize this logic to suit your specific needs
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const milliseconds = date.getMilliseconds();

  // Constructing order number string
  let orderNumber = `ORD-${year}${month}${day}-${milliseconds}`;

  // Check if orderNumber already exists
  let orderExists = await Order.findOne({ orderNumber });

  // If orderNumber already exists, regenerate
  while (orderExists) {
    orderNumber = `ORD-${year}${month}${day}-${milliseconds}`;
    orderExists = await Order.findOne({ orderNumber });
  }

  return orderNumber;
};

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
        unit_amount: Math.round(product.price * 100),
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

  // Generate the Order Number
  const orderNumber = await generateOrderNumber();

  const newOrder = await Order.create({
    user: req.user.id,
    items: orderItems,
    total: total,
    orderStatus: "pending",
    orderNumber,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `https://ecommerce-seven-opal-44.vercel.app/orders`,
    cancel_url: `https://ecommerce-seven-opal-44.vercel.app/`,
    customer_email: req.user.email,
    client_reference_id: newOrder._id.toString(),
    line_items: line_items,
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "CA"],
    },
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

const createOrderCheckout = async (event) => {
  const session = event.data.object;
  const id = new mongoose.Types.ObjectId(session.client_reference_id);

  try {
    // Update order with paid status and shipping details
    const shippingDetails = {
      addressLine1: session.shipping.address.line1,
      addressLine2: session.shipping.address.line2,
      city: session.shipping.address.city,
      state: session.shipping.address.state,
      country: session.shipping.address.country,
      postalCode: session.shipping.address.postal_code,
      contactName: session.shipping.name,
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: "paid",
        shippingDetails: shippingDetails,
      },
      { new: true }
    );

    if (updatedOrder) {
      // Find the user's cart and empty it
      const userCart = await Cart.findOne({ user: updatedOrder.user });
      if (userCart) {
        userCart.items = []; // Empty the items array
        await userCart.save(); // Save the updated cart
      }
    }

    console.log(updatedOrder, "Updated order");
  } catch (error) {
    console.log("Error updating order or clearing cart:", error.message);
  }
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
  console.log("get all orders");

  // Get User Id from Request object, assuming it is set there after authentication
  const userId = req.user._id;

  const orders = await Order.find({
    user: userId, // Filtering by user
    orderStatus: "paid", // Filtering by paid status
  }).populate({
    path: "items.product", // Populating the product in each order item
    model: "Game", // Using the correct 'Game' model
    select: "name description price image", // Selecting fields to populate
  });

  console.log(orders, "orders");

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

// console.log("session", session);
// const order = session.client_reference_id;
// console.log(order, "orderID");
// const user = (await User.findOne({ email: session.customer_email })).id;
// const price = session.display_items[0].amount / 100;
// await Order.findByIdAndUpdate(order, { orderStatus: "paid" });

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
