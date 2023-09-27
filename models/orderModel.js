import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Game",
    required: [true, "An order item must reference a Product"],
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: [true, "An order item must have a price"],
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "An order must belong to a User"],
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: [true, "An order must have a total price"],
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  orderNumber: {
    type: String,
    required: [true, "An order must have an order number"],
  },
  orderStatus: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  shippingStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Out for Delivery", "Delivered"],
    default: "Processing",
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  shippingDetails: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    contactName: String,
  },
  orderStatusHistory: [
    {
      status: String,
      changedAt: Date,
    },
  ],
});

// orderSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "items.product",
//     model: "Game", // Adjusting to use 'Game' model
//     select: "name description price image",
//   });
//   next();
// });

const Order = mongoose.model("Order", orderSchema);

export default Order;
